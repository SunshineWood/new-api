package helper

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/pkoukk/tiktoken-go"
	"net/http"
	"one-api/common"
	"one-api/dto"
	"strings"
)

func SetEventStreamHeaders(c *gin.Context) {
	// 检查是否已经设置过头部
	if _, exists := c.Get("event_stream_headers_set"); exists {
		return
	}

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.Header().Set("Transfer-Encoding", "chunked")
	c.Writer.Header().Set("X-Accel-Buffering", "no")

	// 设置标志，表示头部已经设置过
	c.Set("event_stream_headers_set", true)
}

func ClaudeData(c *gin.Context, resp dto.ClaudeResponse) error {
	jsonData, err := json.Marshal(resp)
	if err != nil {
		common.SysError("error marshalling stream response: " + err.Error())
	} else {
		// Format the entire SSE event as a single render call to avoid extra newlines
		// SSE format requires: "event: TYPE\ndata: DATA\n\n"
		sseData := fmt.Sprintf("event: %s\ndata: %s\n\n", resp.Type, string(jsonData))
		c.Render(-1, common.CustomEvent{Data: sseData})
	}
	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
	} else {
		return errors.New("streaming error: flusher not found")
	}
	return nil
}

func ClaudeChunkData(c *gin.Context, resp dto.ClaudeResponse, data string) {
	// Format the entire SSE event as a single render call to avoid extra newlines
	// SSE format requires: "event: TYPE\ndata: DATA\n\n"
	sseData := fmt.Sprintf("event: %s\ndata: %s\n\n", resp.Type, data)
	c.Render(-1, common.CustomEvent{Data: sseData})
	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
	}
}

func ResponseChunkData(c *gin.Context, resp dto.ResponsesStreamResponse, data string) {
	c.Render(-1, common.CustomEvent{Data: fmt.Sprintf("event: %s\n", resp.Type)})
	c.Render(-1, common.CustomEvent{Data: fmt.Sprintf("data: %s", data)})
	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
	}
}

func StringData(c *gin.Context, str string) error {
	// 去除可能存在的 SSE 前缀和尾部换行
	str = strings.TrimPrefix(str, "data: ")
	str = strings.TrimRight(str, "\r\n")

	// 不再自己追加换行，交给 CustomEvent 在内部统一输出 \n\n 分隔
	sseData := fmt.Sprintf("data: %s", str)
	c.Render(-1, common.CustomEvent{Data: sseData})

	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
		return nil
	}
	return errors.New("streaming error: flusher not found")
}

func PingData(c *gin.Context) error {
	c.Writer.Write([]byte(": PING\n\n"))
	if flusher, ok := c.Writer.(http.Flusher); ok {
		flusher.Flush()
	} else {
		return errors.New("streaming error: flusher not found")
	}
	return nil
}

func ObjectData(c *gin.Context, object interface{}) error {
	if object == nil {
		return errors.New("object is nil")
	}
	jsonData, err := json.Marshal(object)
	if err != nil {
		return fmt.Errorf("error marshalling object: %w", err)
	}
	return StringData(c, string(jsonData))
}

func EstimateTokenCount(text string) int {
	encoding := "cl100k_base" // Claude 使用的编码
	tiktoken, err := tiktoken.GetEncoding(encoding)
	if err != nil {
		return len(text) / 4 // 粗略估计，如果无法获取分词器
	}
	tokens := tiktoken.Encode(text, nil, nil)
	return len(tokens)
}

func Done(c *gin.Context) {
	_ = StringData(c, "[DONE]")
}

func WssString(c *gin.Context, ws *websocket.Conn, str string) error {
	if ws == nil {
		common.LogError(c, "websocket connection is nil")
		return errors.New("websocket connection is nil")
	}
	//common.LogInfo(c, fmt.Sprintf("sending message: %s", str))
	return ws.WriteMessage(1, []byte(str))
}

func WssObject(c *gin.Context, ws *websocket.Conn, object interface{}) error {
	jsonData, err := json.Marshal(object)
	if err != nil {
		return fmt.Errorf("error marshalling object: %w", err)
	}
	if ws == nil {
		common.LogError(c, "websocket connection is nil")
		return errors.New("websocket connection is nil")
	}
	//common.LogInfo(c, fmt.Sprintf("sending message: %s", jsonData))
	return ws.WriteMessage(1, jsonData)
}

func WssError(c *gin.Context, ws *websocket.Conn, openaiError dto.OpenAIError) {
	errorObj := &dto.RealtimeEvent{
		Type:    "error",
		EventId: GetLocalRealtimeID(c),
		Error:   &openaiError,
	}
	_ = WssObject(c, ws, errorObj)
}

func GetResponseID(c *gin.Context) string {
	logID := c.GetString(common.RequestIdKey)
	return fmt.Sprintf("chatcmpl-%s", logID)
}

func GetLocalRealtimeID(c *gin.Context) string {
	logID := c.GetString(common.RequestIdKey)
	return fmt.Sprintf("evt_%s", logID)
}

func GenerateStopResponse(id string, createAt int64, model string, finishReason string) *dto.ChatCompletionsStreamResponse {
	return &dto.ChatCompletionsStreamResponse{
		Id:                id,
		Object:            "chat.completion.chunk",
		Created:           createAt,
		Model:             model,
		SystemFingerprint: nil,
		Choices: []dto.ChatCompletionsStreamResponseChoice{
			{
				FinishReason: &finishReason,
			},
		},
	}
}

func GenerateFinalUsageResponse(id string, createAt int64, model string, usage dto.Usage) *dto.ChatCompletionsStreamResponse {
	return &dto.ChatCompletionsStreamResponse{
		Id:                id,
		Object:            "chat.completion.chunk",
		Created:           createAt,
		Model:             model,
		SystemFingerprint: nil,
		Choices:           make([]dto.ChatCompletionsStreamResponseChoice, 0),
		Usage:             &usage,
	}
}

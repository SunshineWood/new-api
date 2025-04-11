import React, { useContext, useEffect, useState } from 'react';
import { Card, Col, Row } from '@douyinfe/semi-ui';
import { API, showError, showNotice, timestamp2string } from '../../helpers';
import { StatusContext } from '../../context/Status';
import { marked } from 'marked';
import { StyleContext } from '../../context/Style/index.js';
import { useTranslation } from 'react-i18next';
import './index.css';
const Home = () => {
  const { t, i18n } = useTranslation();
  const [statusState] = useContext(StatusContext);
  const [homePageContentLoaded, setHomePageContentLoaded] = useState(false);
  const [homePageContent, setHomePageContent] = useState('');
  const [styleState, styleDispatch] = useContext(StyleContext);

  const displayNotice = async () => {
    const res = await API.get('/api/notice');
    const { success, message, data } = res.data;
    if (success) {
      let oldNotice = localStorage.getItem('notice');
      if (data !== oldNotice && data !== '') {
        const htmlNotice = marked(data);
        showNotice(htmlNotice, true);
        localStorage.setItem('notice', data);
      }
    } else {
      showError(message);
    }
  };

  const displayHomePageContent = async () => {
    setHomePageContent(localStorage.getItem('home_page_content') || '');
    const res = await API.get('/api/home_page_content');
    const { success, message, data } = res.data;
    if (success) {
      let content = data;
      if (!data.startsWith('https://')) {
        content = marked.parse(data);
      }
      setHomePageContent(content);
      localStorage.setItem('home_page_content', content);

        // 如果内容是 URL，则发送主题模式
        if (data.startsWith('https://')) {
            const iframe = document.querySelector('iframe');
            if (iframe) {
                const theme = localStorage.getItem('theme-mode') || 'light';
                // 测试是否正确传递theme-mode给iframe
                // console.log('Sending theme-mode to iframe:', theme); 
                iframe.onload = () => {
                    iframe.contentWindow.postMessage({ themeMode: theme }, '*');
                    iframe.contentWindow.postMessage({ lang: i18n.language }, '*');
                };
            }
        }
    } else {
      showError(message);
      setHomePageContent('加载首页内容失败...');
    }
    setHomePageContentLoaded(true);
  };

  const getStartTimeString = () => {
    const timestamp = statusState?.status?.start_time;
    return statusState.status ? timestamp2string(timestamp) : '';
  };

  useEffect(() => {
    displayNotice().then();
    displayHomePageContent().then();
  }, []);

  return (
    <>
      {homePageContentLoaded && homePageContent === '' ? (
        <>
          {/* 滚动公告区域 */}
          <div className="vertical-scroll-container">
            <div className="vertical-scroll-content">
              <p>{' '}</p> {/* 第一行空白 */}
              <p>{' '}</p> {/* 第二行空白 */}
              <p>👍
                MossX AI系统所有接口已对透传进行了屏蔽并修改了默认端口，您的下游没有任何途径可以联系到我们，同时已隐藏所有报错可能出现的接口地址，让你不再面临客户逐渐流失的问题</p>
              <p>👍【DeepSeek-R1】【DeepSeek-V3t】已提高10倍并发以应对需求，默认为671B满血版，同时我们免费提供整卡自部署+官方双渠道备用，大幅优化延迟（2/2）</p>
              <p>🆕 Claude全模型已兼容v1/messages官方请求格式，并且完全通过官方缓冲创建和缓冲命中计费规则！</p>
              <p>⚠️
                近期很多客户反馈部分中转站已偷偷修改后台倍率来提高价格，标价1美金兑换实际后台消耗为官方价格的5倍，请注意鉴别低价兑换比例谨防上当，虽然成本急剧上涨，但是计费规则和倍率均无改变，我们会继续提供优质稳定的服务</p>
            </div>
          </div>

          {/* 快速导航区域 */}
          <div className="navigation-section">
            <h2 id="快速导航">快速导航</h2>
            <ul className="nav-links">
              <li><a href="#实时接口状态">实时接口状态</a> | <a
                  href="#支持模型">支持模型</a></li>
              <li><a href="#快速开始">快速开始</a> | <a
                  href="#接入教程">接入教程</a></li>
              <li><a href="#APIKey获取">APIKey获取</a> | <a
                  href="#购买流程">购买流程</a></li>
              <li><a href="#Midjourney接入">Midjourney接入</a> | <a
                  href="#二次转发MJ">二次转发MJ</a></li>
              <li><a href="#申请代理">申请代理</a> | <a
                  href="#申请MossX AI会员">申请MossX AI会员</a></li>
              <li><a href="#常见问题">常见问题</a> | <a
                  href="#联系我们">联系我们</a></li>
            </ul>
          </div>

          {/* 内容区域 */}
          <div className="content-section">
            {/* MossX AIAPI介绍 */}
            <section id="MossX API介绍" className="intro-section">
              <h2>MossX API 介绍</h2>
              <div className="section-content">
                <div className="intro-badges">
                  <a href="https://raw.githubusercontent.com/Calcium-Ion/new-api/main/LICENSE">
                    <img
                        src="https://img.shields.io/github/license/Calcium-Ion/new-api?color=brightgreen"
                        alt="license"/>
                  </a>
                  <a href="https://github.com/Calcium-Ion/new-api/releases/latest">
                    <img
                        src="https://img.shields.io/github/v/release/Calcium-Ion/new-api?color=brightgreen&include_prereleases"
                        alt="release"/>
                  </a>
                  <a href="https://github.com/users/Calcium-Ion/packages/container/package/new-api">
                    <img src="https://img.shields.io/badge/docker-ghcr.io-blue"
                         alt="docker"/>
                  </a>
                  <a href="https://hub.docker.com/r/CalciumIon/new-api">
                    <img src="https://img.shields.io/badge/docker-dockerHub-blue"
                         alt="docker"/>
                  </a>
                  <a href="https://goreportcard.com/report/github.com/Calcium-Ion/new-api">
                    <img
                        src="https://goreportcard.com/badge/github.com/Calcium-Ion/new-api"
                        alt="GoReportCard"/>
                  </a>
                </div>

                <div className="intro-text">

                  <p>🌍 <span
                      className="highlight">#1 Brand 大模型全链路API聚合品牌：</span>恭喜你！找到了全网最稳定的Enterprise企业级大模型API分发系统，<span
                      className="highlight">100%全部使用高质量的官方企业极速渠道</span>非低价智商阉割或逆向渠道（支持官方Function
                    calling，N参数，response_format等结构化输出验证），已触达美国、加拿大、英国、德国、日本、韩国、俄罗斯等<span
                        className="highlight">18</span>个地区共计<span
                        className="highlight">15万+</span>客户，<span
                        className="highlight">300+</span>企业（✲7个站点累计），<span
                        className="highlight">已稳定运行25个月</span>
                  </p>

                  <p>💰 为方便计费，一个账号通用本站所有模型，本站当前兑换比例为<span
                      className="highlight">模型计费全部公开透明，目前同步官方计费，全部为官方账号转发API<a
                      href="https://api.mossx.tech/log">日志</a>中点选记录可显示具体的计费公式</span>
                  </p>

                  <p>⭐ 按量计费，无需承担额度过期或者封号风险，所有用户免费享受<span
                      className="highlight"><a>1000Mbps上下行全球带宽</a></span><span
                      className="highlight">和企业级超高并发云数据库RDS</span>，<span
                      className="highlight">超强自研能力，基于渠道 RPM和TPM的智能负载均衡算法，响应快速，大幅降低失败率重试率，每日可承接<a>250M次左右请求</a></span>
                  </p>

                  <p>🔑 每一笔调用的<span className="highlight">消耗明细都公开透明零误差计费（为方便理解，<a
                      href="https://api.mossx.tech/log">日志明细</a>和<a
                      href="https://api.mossx.tech/pricing">定价</a>页面显示均为美元额度计费，实际使用成本请自行按照充值比例兑换成RMB价格）</span>，感谢新老客户一直以来的信任！（✲
                    为保障数据库的快速访问，日志每月1号清理，请知悉）</p>

                  <p>⚡ <span
                      className="highlight">注册即送免费额度可直接使用所有模型</span>，5刀额度起充，分享注册邀请链接每个邀请人和受邀请人均可获得额外额度，以任何形式分享本站推广信息最高赠送100刀额度，另外推荐企业客户可获巨额红包返现，具体请咨询客服！
                  </p>

                  <p>🎈 <span className="highlight">100%</span>同步官方计费倍率和规则，<span
                      className="highlight">无掺假无广告无保留或出售数据，性价比最高的稳定三无纯净API源头，旗下已有185位中转代理！</span>
                  </p>

                  <p>📝 完全兼容OpenAI接口协议，支持<span
                      className="highlight">无缝对接超过500+AI模型</span>到各种支持OpenAI接口的应用！
                  </p>

                  <p>🇺🇸 我们多机部署了<span className="highlight"><a>10台</a></span>离OpenAI最近的<span
                      className="highlight">美国线路</span>服务器，出现波动自动切换服务器进行<span
                      className="highlight">负载均衡</span>，确保全球用户都能以最快速度获得响应！
                  </p>

                  <p>⏰ 已开通<span className="highlight">7*24小时<a
                      href="https://api2.aigcbest.top/topup">自助充值</a></span>服务，保障您的服务不会中断，<span
                      className="highlight">支持电子发票、签署合同、提供盖章报价单等！</span>
                  </p>

                  <p>🙏🏻 <span
                      className="highlight">网站服务宗旨：让每个人用最简单最实惠的方式使用所有AI模型，打破行业壁垒，树立头部榜样，促进和普及人工智能的合规发展。本站非盈利性，所有收入均用作网站的运维成本以及合作商的渠道费用</span>
                  </p>

                </div>
              </div>
            </section>

            <section id="实时接口状态">
              <h2>实时接口状态（最近1小时600次并发压测调用平均成功率）</h2>
              <div className="section-content">
                <p>这里是实时接口状态的内容，展示接口健康状况和成功率数据...</p>
                <h2>支持模型（实时更新全网最新模型，一手渠道，当前模型总数为<span className="highlight">495</span>）</h2>
                <p>
                  <img src="https://uptime.mossx.tech/api/badge/10/uptime?labelPrefix=DeepSeek-chat%E6%8E%A5%E5%8F%A3%E7%8A%B6%E6%80%81+&suffix=%25%E5%8F%AF%E7%94%A8&style=for-the-badge" alt="DeepSeek-Chat" />
                  <img src="https://uptime.mossx.tech/api/badge/11/uptime?labelPrefix=DeepSeek-Reasoner%E6%8E%A5%E5%8F%A3%E7%8A%B6%E6%80%81+&suffix=%25%E5%8F%AF%E7%94%A8&style=for-the-badge" alt="DeepSeek-Reasoner" />
                  <img src="https://uptime.mossx.tech/api/badge/7/uptime?labelPrefix=claude-3-5-haiku-20241022%E6%8E%A5%E5%8F%A3%E7%8A%B6%E6%80%81+&suffix=%25%E5%8F%AF%E7%94%A8&style=for-the-badge" alt="claude-3-5-haiku-20241022" />
                  <img src="https://uptime.mossx.tech/api/badge/6/uptime?labelPrefix=claude-3-5-sonnet-20241022%E6%8E%A5%E5%8F%A3%E7%8A%B6%E6%80%81+&suffix=%25%E5%8F%AF%E7%94%A8&style=for-the-badge" alt="claude-3-5-sonnet-20241022" />
                  <img src="https://uptime.mossx.tech/api/badge/5/uptime?labelPrefix=claude-3-7-sonnet-20250219%E6%8E%A5%E5%8F%A3%E7%8A%B6%E6%80%81+&suffix=%25%E5%8F%AF%E7%94%A8&style=for-the-badge" alt="claude-3-7-sonnet-20250219" />
                  <img src="https://uptime.mossx.tech/api/badge/1/uptime?labelPrefix=gpt-4o-latest%E6%8E%A5%E5%8F%A3%E7%8A%B6%E6%80%81+&suffix=%25%E5%8F%AF%E7%94%A8&style=for-the-badge" alt="gpt-4o-latest" />
                </p>
              </div>
            </section>

            <section id="支持模型">
              <h2>支持模型（实时更新全网最新模型，一手货源）</h2>
              <div className="section-content">
                <p>我们支持以下各种先进模型：</p>
                <ul>
                  <li>claude-3-5-haiku-20241022</li>
                  <li>claude-3-5-sonnet-20241022</li>
                  <li>Claude-3-7-sonnet-20250219</li>
                  <li>DeepSeek-Chat</li>
                  <li>DeepSeek-Reasoner</li>
                </ul>
              </div>
            </section>

            <section id="快速开始">
              <h2>快速开始</h2>
              <div className="section-content">
                <p>快速上手我们的API服务，只需简单几步：</p>
                <p><span className="highlight">1秒使用：点击<a href="https://api.mossx.tech/token">令牌</a>，创建一个令牌，点击令牌后面的【聊天】即可一键导入使用</span></p>
                <p><span className="highlight">本程序经过二次开发（可代部署），支持使用我们网站的所有模型，选择模型后会有上传按钮，支持上传所有类型文件进行分析、官方多模态分析、语音转文本（whisper-1），文本转语音（tts1）、GPTS、🎨 Midjourney绘图，如果无法找到需要的模型请在自定义模型输入模型名称并选择即可</span></p>
                <p>温馨提示：本聊天程序已默认填写了本站的接口地址，您直接填入本站后台生成的令牌 key即可使用，如您需要使用官方账号生成的令牌 key 请在设置中将接口地址修改为【api.openai.com】即可，有任何问题请点击设置最下面的【立即清除】</p>
                <p>测试非GPT模型时建议关闭设置中的注入系统级提示信息，否则他都会说自己是ChatGPT，聊天应用默认自动生成标题，日志会出现额外的【gpt-4o-mini】的token消耗，可在设置里面可关闭</p>
              </div>
            </section>

            <section id="接入教程">
              <h2>接入教程</h2>
              <div className="section-content">
                <p>详细的接入指南，包括代码示例和最佳实践：</p>
                <pre>
      <code>
        {`// 示例代码
const response = await fetch('https://api.ifopen.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${YOUR_API_KEY}\`
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [
      {role: "user", content: "你好，请介绍一下自己"}
    ]
  })
});
const data = await response.json();`}
      </code>
    </pre>
              </div>
            </section>


            <section id="APIKey获取">
              <h2>APIKey获取</h2>
              <div className="section-content">
                <p>获取APIKey的步骤：</p>
                <ol>
                  <li>登录到用户控制面板</li>
                  <li>导航到"API管理"部分</li>
                  <li>点击"创建新的API密钥"</li>
                  <li>设置密钥名称和权限范围</li>
                  <li>确认创建并妥善保存您的APIKey</li>
                </ol>
              </div>
            </section>

            <section id="购买流程">
              <h2>购买流程</h2>
              <div className="section-content">
                <p>简单几步完成购买：</p>
                <ol>
                  <li>选择适合您的套餐或充值金额</li>
                  <li>进入结算页面</li>
                  <li>选择支付方式（支持支付宝、微信支付、银行卡等）</li>
                  <li>完成支付</li>
                  <li>系统自动为您的账户充值</li>
                </ol>
              </div>
            </section>

            <section id="Midjourney接入">
              <h2>Midjourney接入</h2>
              <div className="section-content">
                <p>通过我们的API无缝接入Midjourney图像生成能力：</p>
                <p>支持所有Midjourney最新参数和功能，包括：</p>
                <ul>
                  <li>--v 5.2/6.0 版本选择</li>
                  <li>--ar 宽高比设置</li>
                  <li>--stylize 风格化程度调整</li>
                  <li>--chaos 随机性控制</li>
                  <li>各种高级参数组合</li>
                </ul>
              </div>
            </section>

            <section id="二次转发MJ">
              <h2>二次转发MJ</h2>
              <div className="section-content">
                <p>如何设置Midjourney二次转发：</p>
                <ol>
                  <li>配置您的中转服务器</li>
                  <li>设置API转发规则</li>
                  <li>配置鉴权和请求处理逻辑</li>
                  <li>测试连接稳定性</li>
                  <li>监控使用情况和错误日志</li>
                </ol>
              </div>
            </section>

            <section id="申请代理">
              <h2>申请代理（自助免费接入）</h2>
              <div className="section-content">
                <p>成为我们的代理合作伙伴，享受以下优势：</p>
                <ul>
                  <li>更高的API调用折扣</li>
                  <li>专属技术支持</li>
                  <li>更低的批量计费</li>
                  <li>品牌定制方案</li>
                  <li>详细的使用分析和报告</li>
                </ul>
                <p>申请方式：请联系我们的客服或通过合作伙伴页面提交申请</p>
              </div>
            </section>

            <section id="申请MossX AI会员">
              <h2>申请MossX AI会员</h2>
              <div className="section-content">
                <p>MossX AI会员特权：</p>
                <ul>
                  <li>VIP服务器优先调用权</li>
                  <li>更高的并发限制</li>
                  <li>独享的模型资源</li>
                  <li>定制化的技术支持</li>
                  <li>提前获取新模型的测试权限</li>
                </ul>
              </div>
            </section>

            <section id="常见问题">
              <h2>常见问题</h2>
              <div className="section-content">
                <div className="faq-item">
                  <h3>如何解决API调用失败问题？</h3>
                  <p>检查您的API密钥是否正确，网络连接是否稳定，以及请求格式是否符合规范。详细错误代码解释请参见文档。</p>
                </div>
                <div className="faq-item">
                  <h3>计费方式是怎样的？</h3>
                  <p>我们按照实际Token使用量进行计费，不同模型的费率有所不同。您可以在控制面板查看实时的使用统计和余额情况。</p>
                </div>
                <div className="faq-item">
                  <h3>如何提高API响应速度？</h3>
                  <p>选择适合您地区的API节点，减少请求负载，优化传输内容，并考虑启用缓存机制。</p>
                </div>
              </div>
            </section>

            <section id="联系我们">
              <h2>联系我们</h2>
              <div className="section-content">
                <p>有任何问题或需求，欢迎通过以下方式联系我们：</p>
                <ul>
                  <li>客服邮箱：holden.sun@qq.com</li>
                  <li>技术支持：QQ:59773627</li>
                  <li>QQ群：885345386</li>
                </ul>
              </div>
            </section>
          </div>

        </>
      ) : (
        <>
          {homePageContent.startsWith('https://') ? (
            <iframe
              src={homePageContent}
              style={{ width: '100%', height: '100vh', border: 'none' }}
            />
          ) : (
            <div
              style={{ fontSize: 'larger' }}
              dangerouslySetInnerHTML={{ __html: homePageContent }}
            ></div>
          )}
        </>
      )}
    </>
  );
};

export default Home;

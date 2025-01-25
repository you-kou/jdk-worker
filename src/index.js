/**
 * JDK 接口
 */
import * as cheerio from 'cheerio';

export default {
	async fetch(request, env, ctx) {
		const { method } = request;
		const { pathname } = new URL(request.url);

		if (method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
					"Access-Control-Max-Age": "86400",
					"Access-Control-Allow-Headers": request.headers.get(
						"Access-Control-Request-Headers",
					)
				},
			});
		}

		/**
		 * JDK版本信息接口
		 */
		if (pathname === '/versions') {
			if (method === 'GET') {
				// 从维基百科请求包含版本信息的 html 文档
				const url = 'https://zh.wikipedia.org/wiki/Java%E7%89%88%E6%9C%AC%E6%AD%B7%E5%8F%B2';
				const response = await fetch(url, {
					headers: {
						'accept-language': 'zh-CN,zh;q=0.9,ja;q=0.8'
					}
				});
				const htmlText = await response.text();

				// 将 html 文本解析成 Document 对象
				const $ = cheerio.load(htmlText);

				// 获取版本信息
				const result = [];
				const $table = $('table.wikitable').first();
				const trLength = $table.find('tr').length;
				const $trs = $table.find(`tr:nth-child(n+2):nth-child(-n+${trLength-1})`).get();
				$trs.forEach(tr => {
					const $tr = $(tr);
					result.push({
						version: $tr.find('td:nth-child(1)').first().text().split('：')[1].trim(),
						support:  $tr.find('td:nth-child(1)').first().attr('title').trim(),
						releaseDate: $tr.find('td:nth-child(3)').first().text().trim(),
						finalFreePublicUpdateDate: $tr.find('td:nth-child(4)').first().html().trim(),
						lastExtendedSupportDate: $tr.find('td:nth-child(5)').first().html().trim()
					})
				});

				return new Response(JSON.stringify(result), {
					headers: {
						'Content-Type': 'application/json'
					}
				});
			}
		}

		return new Response('Hello world!');
	},
};

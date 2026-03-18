const crypto = require('crypto');
const axios = require('axios');

class HuaweiCDN {
    constructor() {
        this.accessKeyId = process.env.HUAWEI_CDN_ACCESS_KEY_ID;
        this.accessKeySecret = process.env.HUAWEI_CDN_ACCESS_KEY_SECRET;
        this.baseUrl = 'https://cdn.myhuaweicloud.com/v1.0/cdn';
    }

    /**
     * 刷新文件缓存
     * @param {string} url - 要刷新的URL
     * @param {number} maxRetries - 最大重试次数
     * @returns {Promise<Object>} 刷新结果
     */
    async refreshFile(url, maxRetries = 3) {
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`CDN刷新尝试第 ${attempt} 次: ${url}`);

                // 构造请求参数
                const timestamp = new Date().toISOString();
                const host = 'cdn.myhuaweicloud.com';
                const path = '/v1.0/cdn/content/refresh';

                // 构造签名
                const signature = this.generateSignature('POST', path, timestamp, host);

                // 发送请求
                const response = await axios.post(
                    `${this.baseUrl}/content/refresh`,
                    {
                        refresh_task: {
                            type: 'file',
                            urls: [url]
                        }
                    },
                    {
                        headers: {
                            'X-Date': timestamp,
                            'Host': host,
                            'Content-Type': 'application/json',
                            'Authorization': `HMAC-SHA256 Credential=${this.accessKeyId},SignedHeaders=host;x-date,Signature=${signature}`
                        },
                        timeout: 10000 // 10秒超时
                    }
                );

                console.log('CDN刷新成功:', response.data);

                return {
                    success: true,
                    data: response.data,
                    attempt: attempt
                };

            } catch (error) {
                lastError = error;
                console.error(`CDN刷新失败 (第${attempt}次):`, error.message);

                // 如果不是最后一次尝试，等待2秒后重试
                if (attempt < maxRetries) {
                    await this.sleep(2000);
                }
            }
        }

        // 所有尝试都失败
        console.error('CDN刷新最终失败:', lastError.message);

        return {
            success: false,
            error: lastError.message,
            attempt: maxRetries
        };
    }

    /**
     * 生成华为云API签名
     * @param {string} method - HTTP方法
     * @param {string} path - 请求路径
     * @param {string} timestamp - 时间戳
     * @param {string} host - 主机名
     * @returns {string} 签名
     */
    generateSignature(method, path, timestamp, host) {
        // 构造待签名字符串
        const stringToSign = `${method}\n${path}\nx-date:${timestamp}\nhost:${host}`;

        // 使用HMAC-SHA256签名
        const signature = crypto
            .createHmac('sha256', this.accessKeySecret)
            .update(stringToSign)
            .digest('base64');

        return signature;
    }

    /**
     * 延迟函数
     * @param {number} ms - 毫秒数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 检查配置是否完整
     */
    isConfigured() {
        return !!(this.accessKeyId && this.accessKeySecret);
    }
}

module.exports = new HuaweiCDN();

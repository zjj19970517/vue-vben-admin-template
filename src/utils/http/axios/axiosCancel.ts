import type { AxiosRequestConfig } from 'axios';

// 用于存储每个请求的标识和取消函数
const pendingMap = new Map<string, AbortController>();

const getPendingUrl = (config: AxiosRequestConfig): string => {
  return [config.method, config.url].join('&');
};

/**
 * 取消请求
 *
 * @export
 * @class AxiosCanceler
 */
export class AxiosCanceler {

  /**
   * 添加请求到 pending 缓存集合中
   * 每次发起一个请求，都需要调用 addPending
   * @param config 请求配置
   */
  public addPending(config: AxiosRequestConfig): void {
    // 在添加之前，需要先取消该请求
    this.removePending(config);
    // 获取请求的 URL
    const url = getPendingUrl(config);
    // 每个请求都会对应一个 AbortController 实例
    const controller = new AbortController();
    // 正常情况下 config.signal 是没有值的，这里我们设置为 controller.signal
    config.signal = config.signal || controller.signal;
    if (!pendingMap.has(url)) {
      // 最核心之处：将请求的 URL 作为 key，AbortController 实例作为 value 存储到 pendingMap 中
      pendingMap.set(url, controller);
    }
  }

  /**
   * 取消所有等待中的请求
   */
  public removeAllPending(): void {
    pendingMap.forEach((abortController) => {
      if (abortController) {
        // abortController 取消请求
        abortController.abort();
      }
    });
    this.reset();
  }

  /**
   * 取消某个正在进行中的请求
   * @param config 请求配置
   */
  public removePending(config: AxiosRequestConfig): void {
    const url = getPendingUrl(config);
    if (pendingMap.has(url)) {
      // 如果当前请求在等待中，取消它并将其从等待中移除
      const abortController = pendingMap.get(url);
      if (abortController) {
        abortController.abort(url);
      }
      pendingMap.delete(url);
    }
  }

  /**
   * 重置
   */
  public reset(): void {
    pendingMap.clear();
  }
}

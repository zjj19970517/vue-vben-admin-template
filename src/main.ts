import 'uno.css';
import '@/design/index.less';
import '@/components/VxeTable/src/css/index.scss';
import 'ant-design-vue/dist/antd.less';
// Register icon sprite
import 'virtual:svg-icons-register';

import { createApp } from 'vue';

import { registerGlobComp } from '@/components/registerGlobComp';
import { setupGlobDirectives } from '@/directives';
import { setupI18n } from '@/locales/setupI18n';
import { setupErrorHandle } from '@/logics/error-handle';
import { initAppConfigStore } from '@/logics/initAppConfig';
import { router, setupRouter } from '@/router';
import { setupRouterGuard } from '@/router/guard';
import { setupStore } from '@/store';

import App from './App.vue';

async function bootstrap() {
  const app = createApp(App);

  // 配置 store
  setupStore(app);

  // 初始化内部系统配置
  initAppConfigStore();

  // 注册全局组件
  registerGlobComp(app);

  // 多语言配置
  // 异步过程：语言文件可能从服务器端获取
  await setupI18n(app);

  // 配置路由
  setupRouter(app);

  // 路由守卫
  setupRouterGuard(router);

  // 注册全局指令
  setupGlobDirectives(app);

  // 配置全局错误处理
  setupErrorHandle(app);

  // 应用挂载
  app.mount('#app');
}

bootstrap();

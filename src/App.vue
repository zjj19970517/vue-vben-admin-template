<template>
  <ConfigProvider :locale="getAntdLocale">
    <AppProvider>
      <RouterView />
    </AppProvider>
  </ConfigProvider>
</template>

<script lang="ts" setup>
  import { ConfigProvider } from 'ant-design-vue';
  import { AppProvider } from '@/components/Application';
  import { useTitle } from '@/hooks/web/useTitle';
  import { useLocale } from '@/locales/useLocale';
  import 'dayjs/locale/zh-cn';

  // 多语言支持
  const { getAntdLocale } = useLocale();

  // 监听页面变化，动态更新站点标题
  useTitle();
</script>

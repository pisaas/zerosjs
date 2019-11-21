<template>
  <Steps :current="current">
    <Step title="基本信息" content="设置名称、分类等"></Step>
    <Step title="编辑内容" content="编辑主题内容"></Step>
    <Step title="发布" content="发布内容"></Step>
  </Steps>
</template>

<script>
export default {
  props: {
    current: Number
  }
}
</script>
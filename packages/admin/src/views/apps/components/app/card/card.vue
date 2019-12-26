<template>
  <Card v-if="app" class="app-card">
    <div slot="title">
      <b>{{ app.name }}</b>
    </div>
    <div slot="extra">
      <Button icon="md-open" type="text" size="small"
        @click="onEdit" />
    </div>
    <div class="card-body" @click="onBodyClick">
      <div class="app-logo">
        <div v-if="app.avatar" class="image">
          <img :src="app.avatar" />
        </div>
        <div v-else class="no-image">
          <Icon :size="40" type="md-image" />
        </div>
      </div>
      <div class="app-info">
        <div><b>描述：</b>{{ app.desc }}</div>
        <div><b>状态：</b>{{ app.statusName }}</div>
      </div>
    </div>

    <div class="card-footer">
    </div>
  </Card>
</template>

<script>
export default {
  props: {
    type: String,
    app: Object
  },

  data() {
    return {

    }
  },

  methods: {
    onEdit () {
      this.$emit('edit', this.app)
    },

    onBodyClick () {
      this.$emit('click', this.app)
    }
  },
}
</script>

<style lang="less" scoped>
.app-card {
  height: 200px;

  .card-body {
    display: flex;
    cursor: pointer;
    opacity: 0.8;
    padding: 5px 0;

    &:hover {
      opacity: 1;
    }
  }

  .card-footer {
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    padding: 16px;
  }
}

.app-logo {
  .image {
    img {
      width: 64px;
      max-height: 64px;
      border-radius: 5px;
    }
  }
}

.app-info {
  flex: 1;
  padding-left: 10px;
}
</style>
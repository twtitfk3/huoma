<template>
  <div class="activity-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑活动' : '新建活动' }}</span>
          <el-button @click="handleBack">返回</el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item v-if="isEdit" label="活码">
          <el-input v-model="form.code" disabled />
        </el-form-item>

        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称" />
        </el-form-item>

        <el-divider content-position="left">链接配置</el-divider>

        <el-form-item label="主链接" prop="main_link">
          <el-input
            v-model="form.main_link"
            placeholder="当前生效的链接（必填）"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="预备链接1" prop="backup_link_1">
          <el-input
            v-model="form.backup_link_1"
            placeholder="预备链接，随时可切换为主链接（可选）"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="预备链接2" prop="backup_link_2">
          <el-input
            v-model="form.backup_link_2"
            placeholder="预备链接，随时可切换为主链接（可选）"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-form-item label="预备链接3" prop="backup_link_3">
          <el-input
            v-model="form.backup_link_3"
            placeholder="预备链接，随时可切换为主链接（可选）"
            type="textarea"
            :rows="2"
          />
        </el-form-item>

        <el-divider />

        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="form.remark"
            placeholder="请输入备注说明（可选）"
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="inactive">停用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            保存
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { activityApi } from '@/api'

const router = useRouter()
const route = useRoute()

const formRef = ref(null)
const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)

// URL格式验证器
const validateUrl = (_, value, callback) => {
  if (!value) return callback()
  try {
    new URL(value)
    callback()
  } catch {
    callback(new Error('请输入有效的URL（需包含 http:// 或 https://）'))
  }
}

// 表单数据
const form = reactive({
  code: '',
  name: '',
  main_link: '',
  backup_link_1: '',
  backup_link_2: '',
  backup_link_3: '',
  remark: '',
  status: 'active'
})

// 验证规则
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' }
  ],
  main_link: [
    { required: true, message: '请输入主链接', trigger: 'blur' },
    { validator: validateUrl, trigger: 'blur' }
  ],
  backup_link_1: [{ validator: validateUrl, trigger: 'blur' }],
  backup_link_2: [{ validator: validateUrl, trigger: 'blur' }],
  backup_link_3: [{ validator: validateUrl, trigger: 'blur' }]
}

// 获取活动详情
const fetchActivityDetail = async () => {
  try {
    const res = await activityApi.getDetail(route.params.id)
    if (res.success) {
      Object.assign(form, {
        ...res.data,
        backup_link_1: res.data.backup_link_1 || '',
        backup_link_2: res.data.backup_link_2 || '',
        backup_link_3: res.data.backup_link_3 || ''
      })
    }
  } catch (error) {
    ElMessage.error('获取活动详情失败')
    handleBack()
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const payload = {
        name: form.name,
        main_link: form.main_link,
        backup_link_1: form.backup_link_1 || null,
        backup_link_2: form.backup_link_2 || null,
        backup_link_3: form.backup_link_3 || null,
        remark: form.remark,
        status: form.status
      }

      let res
      if (isEdit.value) {
        res = await activityApi.update(route.params.id, payload)
      } else {
        res = await activityApi.create(payload)
      }

      if (res.success) {
        ElMessage.success(isEdit.value ? '更新成功' : '创建成功')
        handleBack()
      }
    } catch (error) {
      ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 返回列表
const handleBack = () => {
  router.push('/activities')
}

onMounted(() => {
  if (isEdit.value) {
    fetchActivityDetail()
  }
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

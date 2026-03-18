<template>
  <div class="activity-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建活动
          </el-button>
        </div>
      </template>

      <el-table
        :data="activities"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="code" label="活码" width="110">
          <template #default="{ row }">
            <el-tag type="info">{{ row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="活动名称" min-width="120" />

        <!-- 主链接 -->
        <el-table-column label="主链接（生效中）" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link :href="row.main_link" target="_blank" type="primary">
              {{ row.main_link }}
            </el-link>
          </template>
        </el-table-column>

        <!-- 预备链接数量 -->
        <el-table-column label="预备链接" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="backupCount(row) > 0 ? 'success' : 'info'" size="small">
              {{ backupCount(row) }} 个
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updated_at" label="最后更新" width="165">
          <template #default="{ row }">
            {{ formatDate(row.updated_at || row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row.id)">
              编辑
            </el-button>
            <el-button link type="warning" size="small" @click="handleSwitch(row)">
              切换链接
            </el-button>
            <el-button link type="success" size="small" @click="handleCopyLink(row.code)">
              复制链接
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: center"
        @size-change="fetchActivities"
        @current-change="fetchActivities"
      />
    </el-card>

    <!-- 切换主链接对话框 -->
    <el-dialog
      v-model="switchDialogVisible"
      title="切换主链接"
      width="520px"
    >
      <div v-if="currentActivity.id">
        <el-alert
          title="手动切换说明"
          type="info"
          :closable="false"
          style="margin-bottom: 16px"
          description="选择一个预备链接，将其设置为新的主链接。原主链接会自动降级为所选槽位的预备链接，立即生效。"
        />

        <!-- 当前主链接 -->
        <div class="link-card link-card--active">
          <div class="link-label">
            <el-tag type="primary" size="small">当前主链接</el-tag>
          </div>
          <div class="link-url">{{ currentActivity.main_link }}</div>
        </div>

        <!-- 预备链接列表 -->
        <div
          v-for="slot in backupSlots"
          :key="slot.key"
          class="link-card"
          :class="{ 'link-card--empty': !currentActivity[slot.key], 'link-card--selected': selectedSlot === slot.key }"
          @click="currentActivity[slot.key] && (selectedSlot = slot.key)"
        >
          <div class="link-label">
            <el-tag :type="currentActivity[slot.key] ? 'success' : 'info'" size="small">
              {{ slot.label }}
            </el-tag>
            <span v-if="!currentActivity[slot.key]" class="empty-hint">（未配置）</span>
          </div>
          <div class="link-url" v-if="currentActivity[slot.key]">
            {{ currentActivity[slot.key] }}
          </div>
          <div class="link-url empty" v-else>暂无链接，可在编辑页面配置</div>
        </div>

        <el-form label-width="80px" style="margin-top: 16px">
          <el-form-item label="操作人">
            <el-input v-model="operator" placeholder="请输入操作人姓名" />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="switchDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleSwitchConfirm"
          :loading="switching"
          :disabled="!selectedSlot"
        >
          确认切换{{ selectedSlot ? '（' + getSlotLabel(selectedSlot) + '→主链接）' : '' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { activityApi } from '@/api'

const router = useRouter()

// 预备链接槽位定义
const backupSlots = [
  { key: 'backup_link_1', label: '预备链接1' },
  { key: 'backup_link_2', label: '预备链接2' },
  { key: 'backup_link_3', label: '预备链接3' }
]

const getSlotLabel = (key) => backupSlots.find(s => s.key === key)?.label || key

// 数据
const activities = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 切换相关
const switchDialogVisible = ref(false)
const currentActivity = ref({})
const selectedSlot = ref('')
const operator = ref('')
const switching = ref(false)

// 计算预备链接数量
const backupCount = (row) => {
  return [row.backup_link_1, row.backup_link_2, row.backup_link_3].filter(Boolean).length
}

// 获取活动列表
const fetchActivities = async () => {
  loading.value = true
  try {
    const res = await activityApi.getList({
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    })
    if (res.success) {
      activities.value = res.data.activities
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 新建活动
const handleCreate = () => {
  router.push('/activities/edit')
}

// 编辑活动
const handleEdit = (id) => {
  router.push(`/activities/edit/${id}`)
}

// 打开切换对话框
const handleSwitch = (activity) => {
  currentActivity.value = { ...activity }
  selectedSlot.value = ''
  operator.value = ''
  switchDialogVisible.value = true
}

// 确认切换
const handleSwitchConfirm = async () => {
  if (!selectedSlot.value) {
    ElMessage.warning('请选择要切换的预备链接')
    return
  }
  if (!operator.value.trim()) {
    ElMessage.warning('请输入操作人')
    return
  }

  switching.value = true
  try {
    const res = await activityApi.switchLinks(currentActivity.value.id, {
      operator: operator.value.trim(),
      target_slot: selectedSlot.value
    })

    if (res.success) {
      ElMessage.success('切换成功，已立即生效')
      switchDialogVisible.value = false
      fetchActivities()
    }
  } catch (error) {
    ElMessage.error(error?.response?.data?.message || '切换失败')
  } finally {
    switching.value = false
  }
}

// 复制活码链接
const handleCopyLink = (code) => {
  // 自动检测当前页面的协议和域名
  const protocol = window.location.protocol
  const domain = window.location.hostname
  const url = `${protocol}//${domain}/${code}`
  
  // 创建一个临时的 input 元素来复制
  const input = document.createElement('input')
  input.value = url
  input.style.position = 'fixed'
  input.style.opacity = '0'
  document.body.appendChild(input)
  input.select()
  input.setSelectionRange(0, 99999)
  
  try {
    document.execCommand('copy')
    ElMessage.success(`已复制：${url}`)
  } catch (err) {
    ElMessage({
      message: `请手动复制：${url}`,
      type: 'info',
      duration: 5000
    })
  }
  
  document.body.removeChild(input)
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-pagination) {
  display: flex;
}

.link-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px 14px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.link-card:hover:not(.link-card--empty):not(.link-card--active) {
  border-color: #409eff;
  background: #f0f7ff;
}

.link-card--active {
  border-color: #409eff;
  background: #ecf5ff;
  cursor: default;
}

.link-card--selected {
  border-color: #67c23a;
  background: #f0f9eb;
}

.link-card--empty {
  opacity: 0.5;
  cursor: not-allowed;
}

.link-label {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.empty-hint {
  font-size: 12px;
  color: #909399;
}

.link-url {
  font-size: 13px;
  color: #303133;
  word-break: break-all;
  line-height: 1.5;
}

.link-url.empty {
  color: #c0c4cc;
  font-style: italic;
}
</style>

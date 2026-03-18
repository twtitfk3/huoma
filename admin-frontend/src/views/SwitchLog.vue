<template>
  <div class="switch-log">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>切换日志</span>
        </div>
      </template>

      <!-- 筛选表单 -->
      <el-form :inline="true" :model="filters" class="filter-form">
        <el-form-item label="操作人">
          <el-input
            v-model="filters.operator"
            placeholder="请输入操作人"
            clearable
          />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="logs"
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="created_at" label="切换时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column prop="activity_name" label="活动名称" min-width="120" />

        <el-table-column prop="code" label="活码" width="100">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ row.code }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="operator" label="操作人" width="100" />

        <el-table-column label="链接变更" min-width="320">
          <template #default="{ row }">
            <div class="switch-content">
              <div class="old-link">切换前：{{ row.old_main_link }}</div>
              <div class="arrow">↓</div>
              <div class="new-link">切换后：{{ row.new_main_link }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="switch_note" label="备注" min-width="150" show-overflow-tooltip />
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: center"
        @size-change="fetchLogs"
        @current-change="fetchLogs"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { switchLogApi } from '@/api'

// 数据
const logs = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 筛选条件
const filters = reactive({ operator: '' })
const dateRange = ref([])

// 获取日志列表
const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      limit: pageSize.value,
      offset: (currentPage.value - 1) * pageSize.value
    }
    if (filters.operator) params.operator = filters.operator
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = await switchLogApi.getList(params)
    if (res.success) {
      logs.value = res.data.logs
      total.value = res.data.total
    }
  } catch (error) {
    ElMessage.error('获取日志列表失败')
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('zh-CN')
}

const handleSearch = () => {
  currentPage.value = 1
  fetchLogs()
}

const handleReset = () => {
  filters.operator = ''
  dateRange.value = []
  currentPage.value = 1
  fetchLogs()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-form {
  margin-bottom: 20px;
}

.switch-content {
  font-size: 12px;
  line-height: 1.6;
}

.old-link {
  color: #909399;
  text-decoration: line-through;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  color: #c0c4cc;
  font-size: 16px;
  line-height: 1.2;
}

.new-link {
  color: #409eff;
  font-weight: bold;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.el-pagination) {
  display: flex;
}
</style>

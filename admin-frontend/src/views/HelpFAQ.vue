<template>
  <div class="help-faq">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>常见问题</span>
          <div class="header-actions">
            <el-input
              v-model="searchText"
              placeholder="搜索问题"
              style="width: 300px"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleEdit" style="margin-left: 12px">
              编辑
            </el-button>
          </div>
        </div>
      </template>

      <div class="faq-content">
        <div v-for="faq in filteredFAQs" :key="faq.id" class="faq-item">
          <h3>{{ faq.question }}</h3>
          <div class="faq-answer" v-html="faq.answer"></div>
        </div>
      </div>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑常见问题" width="80%">
      <el-alert
        title="提示"
        type="info"
        :closable="false"
        style="margin-bottom: 16px"
      >
        在下方编辑常见问题内容，支持添加、删除和修改问题。修改后点击"保存"生效。
      </el-alert>
      
      <div v-for="(faq, index) in editFAQs" :key="index" class="edit-item">
        <el-row :gutter="16">
          <el-col :span="20">
            <el-input v-model="faq.question" placeholder="问题" style="margin-bottom: 8px" />
            <el-input
              v-model="faq.answer"
              type="textarea"
              :rows="3"
              placeholder="回答（支持HTML）"
            />
          </el-col>
          <el-col :span="4" style="text-align: center">
            <el-button type="danger" @click="removeFaq(index)">
              删除
            </el-button>
          </el-col>
        </el-row>
      </div>
      
      <el-button type="primary" plain @click="addFaq" style="margin-top: 16px">
        添加问题
      </el-button>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFaqs">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { configApi } from '@/api'

const searchText = ref('')
const faqs = ref([])
const dialogVisible = ref(false)
const editFAQs = ref([])
const loading = ref(false)

// 默认常见问题
const defaultFaqs = [
  {
    id: 1,
    question: 'Q1：活码是什么？有什么用？',
    answer: '<p><strong>A：</strong>活码是一个可以动态配置跳转目标的短链接（6位随机码）。</p><p>使用活码的优势：</p><ul><li>链接简洁易记，如：<code>https://route.vtc365.cn/AbC123</code></li><li>可以随时切换主链接，无需通知观众</li><li>支持最多3个预备链接，灵活应对各种场景</li></ul>'
  },
  {
    id: 2,
    question: 'Q2：如何切换主链接？',
    answer: '<p><strong>A：</strong>在活动列表中，找到目标活动，点击"切换链接"按钮。选择想要设为主链接的预备链接，点击确认即可。</p>'
  }
]

// 从API加载常见问题
const loadFaqs = async () => {
  try {
    const res = await configApi.get('help_faq')
    if (res.success && res.data) {
      faqs.value = res.data
    } else {
      faqs.value = defaultFaqs
    }
  } catch (error) {
    console.error('加载常见问题失败:', error)
    faqs.value = defaultFaqs
  }
}

const filteredFAQs = computed(() => {
  if (!searchText.value.trim()) {
    return faqs.value
  }

  const search = searchText.value.toLowerCase()
  return faqs.value.filter(faq =>
    faq.question.toLowerCase().includes(search) ||
    (faq.answer && faq.answer.toLowerCase().includes(search))
  )
})

// 编辑相关方法
const handleEdit = () => {
  editFAQs.value = JSON.parse(JSON.stringify(faqs.value))
  dialogVisible.value = true
}

const addFaq = () => {
  const newId = editFAQs.value.length > 0 
    ? Math.max(...editFAQs.value.map(f => f.id || 0)) + 1 
    : 1
  editFAQs.value.push({
    id: newId,
    question: '',
    answer: ''
  })
}

const removeFaq = (index) => {
  editFAQs.value.splice(index, 1)
}

const saveFaqs = async () => {
  // 验证
  const empty = editFAQs.value.find(f => !f.question.trim() || !f.answer.trim())
  if (empty) {
    ElMessage.warning('请填写完整的问题和回答')
    return
  }

  loading.value = true
  try {
    const res = await configApi.set('help_faq', editFAQs.value)
    if (res.success) {
      faqs.value = JSON.parse(JSON.stringify(editFAQs.value))
      dialogVisible.value = false
      ElMessage.success('保存成功')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFaqs()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.faq-content {
  max-height: 70vh;
  overflow-y: auto;
}

.faq-item {
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item h3 {
  font-size: 16px;
  color: #303133;
  margin: 0 0 10px;
  font-weight: 600;
}

.faq-answer {
  line-height: 1.8;
  color: #606266;
}

.faq-answer p {
  margin: 8px 0;
}

.faq-answer ul,
.faq-answer ol {
  padding-left: 20px;
  margin: 8px 0;
}

.faq-answer li {
  margin: 5px 0;
}

.faq-answer code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  color: #e6a23c;
}

.faq-answer strong {
  color: #303133;
  font-weight: 600;
}

.edit-item {
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 16px;
}
</style>

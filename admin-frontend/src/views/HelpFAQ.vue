<template>
  <div class="help-faq">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>常见问题</span>
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
        </div>
      </template>

      <div class="faq-content">
        <div v-for="faq in filteredFAQs" :key="faq.id" class="faq-item">
          <h3>{{ faq.question }}</h3>
          <div class="faq-answer" v-html="faq.answer"></div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'

const searchText = ref('')

const faqs = ref([
  {
    id: 1,
    question: 'Q1：活码是什么？有什么用？',
    answer: `<p><strong>A：</strong>活码是一个可以动态配置跳转目标的短链接（6位随机码）。</p>
            <p>使用活码的优势：</p>
            <ul>
              <li>链接简洁易记，如：<code>https://example.com/AbC123</code></li>
              <li>可以随时切换主链接，无需通知观众</li>
              <li>支持最多3个预备链接，灵活应对各种场景</li>
            </ul>`
  },
  {
    id: 2,
    question: 'Q2：切换主链接后，观众会立即看到效果吗？',
    answer: `<p><strong>A：</strong>是的，立即生效。</p>
            <p>切换操作是直接修改数据库，route-service 每次请求都会读取最新数据。</p>
            <p>观众再次访问活码时，会自动跳转到新的主链接。</p>`
  },
  {
    id: 3,
    question: 'Q3：主链接和预备链接有什么区别？',
    answer: `<p><strong>A：</strong>功能上没有区别，只是角色的区分。</p>
            <p>正常情况下，观众访问的是主链接。</p>
            <p>当需要切换时，可以选择任意一个预备链接设为主链接。</p>
            <p>主链接和选中的预备链接会互换位置。</p>`
  },
  {
    id: 4,
    question: 'Q4：最多可以配置几个预备链接？',
    answer: `<p><strong>A：</strong>最多3个预备链接。</p>
            <p>这些链接都是可选的，可以根据实际需要配置：</p>
            <ul>
              <li>只配主链接：最简单场景</li>
              <li>主链接 + 1个预备：基本备份</li>
              <li>主链接 + 2-3个预备：多平台备份</li>
            </ul>`
  },
  {
    id: 5,
    question: 'Q5：如何知道某个活动被切换过？',
    answer: `<p><strong>A：</strong>查看切换日志。</p>
            <p>在后台的"切换日志"页面，可以看到所有活动的切换历史。</p>
            <p>日志记录了操作人、切换时间、切换前后的链接配置等信息。</p>`
  },
  {
    id: 6,
    question: 'Q6：可以删除已创建的活动吗？',
    answer: `<p><strong>A：</strong>目前不支持删除活动。</p>
            <p>原因：删除后，之前分享的活码将失效，影响已访问的观众。</p>
            <p>建议：如不再使用，可在编辑页面将状态改为"停用"，避免误操作。</p>`
  },
  {
    id: 7,
    question: 'Q7：6位活码会重复吗？',
    answer: `<p><strong>A：</strong>几乎不会。</p>
            <p>6位随机码由大小写字母和数字组成，共有 62^6 ≈ 568亿 种组合。</p>
            <p>系统生成时会检测是否已存在，如存在则重新生成。</p>
            <p>因此，活码重复的概率极低，可以放心使用。</p>`
  },
  {
    id: 8,
    question: 'Q8：切换主链接后，之前的链接还能用吗？',
    answer: `<p><strong>A：</strong>可以。</p>
            <p>切换只是互换主链接和所选预备链接的位置，链接本身不会被删除。</p>
            <p>例如：</p>
            <ul>
              <li>切换前：主链接=A，预备链接1=B</li>
              <li>切换后：主链接=B，预备链接1=A</li>
            </ul>
            <p>两个链接都仍然有效。</p>`
  },
  {
    id: 9,
    question: 'Q9：为什么有时需要切换主链接？',
    answer: `<p><strong>A：</strong>常见场景：</p>
            <ol>
              <li>主链接所在的服务器故障，无法访问</li>
              <li>主链接的照片直播服务异常，无法加载图片</li>
              <li>主链接的带宽不足，访问缓慢</li>
              <li>主链接维护，需要临时切换到备用链接</li>
              <li>根据活动安排切换到不同平台</li>
            </ol>
            <p><strong>总结：</strong>任何影响用户体验的问题，都可以考虑切换主链接。</p>`
  },
  {
    id: 10,
    question: 'Q10：活码的URL是什么格式？',
    answer: `<p><strong>A：</strong>格式为：<code>https://example.com/XXXXXX</code></p>
            <p>其中：</p>
            <ul>
              <li><code>example.com</code>：你的域名</li>
              <li><code>XXXXXX</code>：6位随机码（大小写字母+数字）</li>
            </ul>
            <p>例如：<code>https://example.com/AbC123</code></p>`
  },
  {
    id: 11,
    question: 'Q11：可以在活动进行中切换链接吗？',
    answer: `<p><strong>A：</strong>可以。</p>
            <p>切换操作不会中断已访问的观众。</p>
            <p>新访问的观众会看到切换后的链接。</p>
            <p>已访问的观众可能需要刷新页面才能看到效果。</p>`
  },
  {
    id: 12,
    question: 'Q12：如何备份活动配置？',
    answer: `<p><strong>A：</strong>目前不支持导出配置。</p>
            <p>建议在创建活动时，在备注中记录完整的链接信息。</p>
            <p>如需备份，可以手动复制活动列表中的数据。</p>
            <p>服务器上的数据库文件也可以直接复制备份。</p>`
  },
  {
    id: 13,
    question: 'Q13：切换操作可以撤销吗？',
    answer: `<p><strong>A：</strong>可以。</p>
            <p>再次点击"切换链接"按钮，选择另一个预备链接，即可撤销上一次切换。</p>
            <p>系统会记录每一次操作，可以在切换日志中查看。</p>`
  },
  {
    id: 14,
    question: 'Q14：活码有访问次数限制吗？',
    answer: `<p><strong>A：</strong>没有限制。</p>
            <p>活码的访问次数取决于你的服务器带宽。</p>
            <p>如访问量较大，建议升级服务器配置。</p>`
  },
  {
    id: 15,
    question: 'Q15：系统有健康检测功能吗？',
    answer: `<p><strong>A：</strong>没有。</p>
            <p>系统采用纯手动切换模式：</p>
            <ul>
              <li>不做自动健康检测</li>
              <li>不做自动切换</li>
              <li>完全由管理员人工判断何时切换</li>
            </ul>
            <p>这样更可控，避免误判导致频繁切换。</p>`
  }
])

const filteredFAQs = computed(() => {
  if (!searchText.value.trim()) {
    return faqs.value
  }

  const search = searchText.value.toLowerCase()
  return faqs.value.filter(faq =>
    faq.question.toLowerCase().includes(search) ||
    faq.answer.toLowerCase().includes(search)
  )
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
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
</style>

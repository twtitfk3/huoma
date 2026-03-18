<template>
  <div class="help-guide">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>使用说明</span>
        </div>
      </template>

      <el-collapse v-model="activeNames">
        <!-- 系统简介 -->
        <el-collapse-item title="1. 系统简介" name="1">
          <div class="help-content">
            <h3>活码管理系统简介</h3>
            <p>用于管理活动照片直播链接的主/备切换，确保活动顺利进行。</p>

            <h4>核心功能：</h4>
            <ul>
              <li>创建活动，生成6位活码</li>
              <li>配置1个主链接 + 最多3个预备链接</li>
              <li>手动切换：选择任意预备链接设为主链接，立即生效</li>
              <li>查看切换日志，追溯操作历史</li>
            </ul>
          </div>
        </el-collapse-item>

        <!-- 快速开始 -->
        <el-collapse-item title="2. 快速开始" name="2">
          <div class="help-content">
            <h3>第一步：创建活动</h3>
            <ol>
              <li>点击"新建活动"按钮</li>
              <li>填写活动名称、主链接</li>
              <li>可选择填写1-3个预备链接</li>
              <li>点击"保存"，系统自动生成6位活码</li>
            </ol>

            <h3>第二步：使用活码</h3>
            <ol>
              <li>复制生成的活码（如：AbC123）</li>
              <li>拼接到域名：<el-tag type="info">https://route.vtc365.cn/AbC123</el-tag></li>
              <li>将链接分享给观众</li>
            </ol>

            <h3>第三步：切换主链接（如有需要）</h3>
            <ol>
              <li>在活动列表找到对应活动</li>
              <li>点击"切换链接"按钮</li>
              <li>选择要设为主链接的预备链接</li>
              <li>输入操作人，点击确认</li>
              <li>立即生效</li>
            </ol>
          </div>
        </el-collapse-item>

        <!-- 功能详解 -->
        <el-collapse-item title="3. 功能详解" name="3">
          <div class="help-content">
            <h3>3.1 创建活动</h3>
            <h4>功能说明：</h4>
            <p>创建新的活动，生成唯一的6位活码。</p>

            <h4>字段说明：</h4>
            <ul>
              <li><strong>活动名称</strong>：活动的中文名称，用于识别</li>
              <li><strong>主链接</strong>：当前生效的链接，观众默认访问此链接（必填）</li>
              <li><strong>预备链接1-3</strong>：备用链接，可随时切换为主链接（可选）</li>
              <li><strong>备注说明</strong>：可选，记录活动的其他信息</li>
            </ul>

            <h4>注意事项：</h4>
            <ul>
              <li>活码生成后不可修改，请谨慎填写信息</li>
              <li>主链接必须填写完整URL（如：https://xxx.com）</li>
              <li>预备链接为可选，不填则为空</li>
              <li>备注信息仅内部可见，不影响活码功能</li>
            </ul>

            <h3>3.2 手动切换主链接</h3>
            <h4>功能说明：</h4>
            <p>选择任意一个预备链接，将其设置为主链接，原主链接自动降级为所选槽位的预备链接。</p>

            <h4>应用场景：</h4>
            <ul>
              <li>主链接故障，需要立即切换到备用链接</li>
              <li>主链接恢复后，需要切回原链接</li>
              <li>根据活动需要切换到其他平台</li>
            </ul>

            <h4>操作步骤：</h4>
            <ol>
              <li>在活动列表中找到目标活动</li>
              <li>点击"切换链接"按钮</li>
              <li>选择要设为主链接的预备链接（点击高亮选中）</li>
              <li>输入操作人姓名</li>
              <li>点击确认</li>
              <li>立即生效</li>
            </ol>

            <h4>切换规则：</h4>
            <ul>
              <li>切换是互通的：主链接 ↔ 选中的预备链接互换位置</li>
              <li>切换立即生效，无需等待</li>
              <li>切换记录会保存到日志</li>
            </ul>

            <h3>3.3 查看切换日志</h3>
            <h4>功能说明：</h4>
            <p>查看所有活动的切换历史记录。</p>

            <h4>日志内容：</h4>
            <ul>
              <li>切换时间</li>
              <li>操作人</li>
              <li>活动名称</li>
              <li>切换前的主链接</li>
              <li>切换后的主链接</li>
              <li>切换备注</li>
            </ul>

            <h4>用途：</h4>
            <ul>
              <li>追溯操作历史，排查问题</li>
              <li>统计切换次数，评估服务质量</li>
              <li>审计操作记录，确保责任可追溯</li>
            </ul>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeNames = ref(['1'])
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-content {
  line-height: 1.8;
  padding: 10px 0;
}

.help-content h3 {
  font-size: 18px;
  color: #303133;
  margin: 20px 0 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content h4 {
  font-size: 16px;
  color: #606266;
  margin: 15px 0 8px;
}

.help-content p {
  color: #606266;
  margin: 8px 0;
}

.help-content ul,
.help-content ol {
  padding-left: 20px;
  margin: 8px 0;
}

.help-content li {
  color: #606266;
  margin: 5px 0;
}

.help-content strong {
  color: #303133;
}
</style>

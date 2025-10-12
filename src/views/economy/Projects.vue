<template>
  <div class="projects-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="view-tabs">
        <el-radio-group v-model="currentView" @change="handleViewChange">
          <el-radio-button label="dashboard">数据看板</el-radio-button>
          <el-radio-button label="table">表格视图</el-radio-button>
        </el-radio-group>
      </div>
      
      <div class="toolbar-actions">
        <el-button type="success" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button v-if="isAdmin" type="primary" @click="handleAddProject">
          <el-icon><Plus /></el-icon>
          新增项目
        </el-button>
      </div>
    </div>

    <!-- 筛选条件区域 - 只在表格视图显示 -->
    <el-card v-if="currentView === 'table'" class="filter-card" shadow="never">
      <!-- 搜索头部 -->
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
        <div class="header-actions">
          <el-button 
            type="text" 
            @click="toggleSearchExpanded"
            class="toggle-btn"
          >
            <el-icon v-if="!searchExpanded"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ searchExpanded ? '收起' : '展开' }}
          </el-button>
        </div>
      </div>
      
      <!-- 快速搜索区域（始终显示） -->
      <div class="quick-search">
        <el-form :model="searchForm" class="quick-search-form">
          <div class="search-input-group">
            <el-input
              v-model="searchForm.objectName"
              placeholder="请输入项目名称或负责人姓名"
              clearable
              class="search-input"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch" class="search-btn">
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset" class="reset-btn">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </el-form>
      </div>
      
      <!-- 详细搜索区域（可折叠） -->
      <el-collapse-transition>
        <div v-show="searchExpanded" class="detailed-search">
          <el-form :model="searchForm" class="filter-form">
            <!-- 基本信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Briefcase /></el-icon>
                <span>项目信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="项目名称">
                  <el-input
                    v-model="searchForm.objectName"
                    placeholder="请输入项目名称"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="负责人">
                  <el-input
                    v-model="searchForm.managerName"
                    placeholder="请输入负责人姓名"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="项目类型">
                  <el-select v-model="searchForm.typeId" placeholder="请选择项目类型" clearable class="form-select">
                    <el-option 
                      v-for="option in projectTypeOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="项目状态">
                  <el-select v-model="searchForm.statusId" placeholder="请选择项目状态" clearable class="form-select">
                    <el-option 
                      v-for="option in projectStatusOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="项目地址">
                  <el-input
                    v-model="searchForm.address"
                    placeholder="请输入项目地址"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 负责人信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><User /></el-icon>
                <span>负责人信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="负责人姓名">
                  <el-input
                    v-model="searchForm.managerName"
                    placeholder="请输入负责人姓名"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="性别">
                  <el-select v-model="searchForm.gender" placeholder="请选择性别" clearable class="form-select">
                    <el-option label="男" value="MALE" />
                    <el-option label="女" value="FEMALE" />
                  </el-select>
                </el-form-item>
                <el-form-item label="年龄范围">
                  <div class="range-input-group">
                    <el-input
                      v-model="searchForm.minAge"
                      placeholder="最小年龄"
                      type="number"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model="searchForm.maxAge"
                      placeholder="最大年龄"
                      type="number"
                      class="range-input"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>

            <!-- 财务信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Money /></el-icon>
                <span>财务信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="投资金额">
                  <div class="range-input-group">
                    <el-input
                      v-model="searchForm.minInvestment"
                      placeholder="最小金额"
                      type="number"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model="searchForm.maxInvestment"
                      placeholder="最大金额"
                      type="number"
                      class="range-input"
                    />
                  </div>
                </el-form-item>
                <el-form-item label="年收入">
                  <div class="range-input-group">
                    <el-input
                      v-model="searchForm.minAnnualRevenue"
                      placeholder="最小收入"
                      type="number"
                      class="range-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model="searchForm.maxAnnualRevenue"
                      placeholder="最大收入"
                      type="number"
                      class="range-input"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>

            <!-- 时间信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Calendar /></el-icon>
                <span>时间信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="开始时间">
                  <el-date-picker
                    v-model="searchForm.startDate"
                    type="date"
                    placeholder="选择开始时间"
                    clearable
                    class="form-date-picker"
                  />
                </el-form-item>
                <el-form-item label="结束时间">
                  <el-date-picker
                    v-model="searchForm.endDate"
                    type="date"
                    placeholder="选择结束时间"
                    clearable
                    class="form-date-picker"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="filter-actions">
              <el-button type="primary" @click="handleAdvancedSearch" class="search-btn">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset" class="reset-btn">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </div>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>
    
    <!-- 数据看板视图 -->
    <template v-if="currentView === 'dashboard'">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-text">
              <p class="stat-label">项目总数</p>
              <h3 class="stat-value">{{ projectCount }}</h3>
            </div>
            <div class="stat-icon">
              <el-icon><List /></el-icon>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-text">
              <p class="stat-label">总投资金额</p>
              <h3 class="stat-value">¥{{ totalInvestment.toLocaleString() }}</h3>
            </div>
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-text">
              <p class="stat-label">累计收益</p>
              <h3 class="stat-value">¥{{ totalIncome.toLocaleString() }}</h3>
            </div>
            <div class="stat-icon">
              <el-icon><Money /></el-icon>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-text">
              <p class="stat-label">平均收益率</p>
              <h3 class="stat-value">{{ averageReturnRate }}%</h3>
            </div>
            <div class="stat-icon">
              <el-icon><TrendCharts /></el-icon>
            </div>
          </div>
        </el-card>
      </div>
      
      <!-- 图表分析区域 -->
      <div class="charts-section">
        <div class="chart-row">
          <!-- 项目类型分布饼图 -->
          <el-card class="chart-card" shadow="hover">
          <template #header>
              <div class="chart-header">
                <el-icon><PieChart /></el-icon>
                <span>项目类型分布</span>
            </div>
          </template>
            <div ref="typeChartRef" class="chart-container"></div>
        </el-card>
        
          <!-- 投资金额排行 -->
          <el-card class="chart-card" shadow="hover">
          <template #header>
              <div class="chart-header">
                <el-icon><TrendCharts /></el-icon>
                <span>投资金额排行</span>
            </div>
          </template>
            <div ref="investmentChartRef" class="chart-container"></div>
          </el-card>
            </div>

        <div class="chart-row">
          <!-- 投资回报率分析 -->
          <el-card class="chart-card full-width" shadow="hover">
            <template #header>
              <div class="chart-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>投资回报率分析</span>
          </div>
            </template>
            <div ref="returnRateChartRef" class="chart-container"></div>
        </el-card>
        </div>
      </div>
      
      <!-- 最近项目 -->
      <el-card class="recent-projects">
        <template #header>
          <div class="card-header">
            <span>最近项目</span>
            <el-button type="text" @click="switchToTableView">查看全部</el-button>
          </div>
        </template>
        <div class="recent-projects-grid">
          <div 
            v-for="project in recentProjectsData.slice(0, 5)" 
            :key="project.id" 
            class="project-card"
            @click="handleViewDetail(project)"
          >
            <div class="project-header">
              <h4 class="project-title">{{ project.objectName }}</h4>
              <el-tag :type="getStatusType(project.statusId)" size="small">
                {{ project.statusName }}
              </el-tag>
            </div>
            <div class="project-content">
              <div class="project-info">
                <div class="info-item">
                  <el-icon><Briefcase /></el-icon>
                  <span>{{ project.typeName }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Money /></el-icon>
                  <span>¥{{ Number(project.investment).toLocaleString() }}</span>
                </div>
                <div class="info-item">
                  <el-icon><TrendCharts /></el-icon>
                  <span>¥{{ Number(project.annualRevenue).toLocaleString() }}</span>
                </div>
              </div>
              <div class="project-manager" v-if="project.name">
                <el-icon><User /></el-icon>
                <span>{{ project.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </template>
    
    <!-- 表格视图 -->
    <template v-else>
      <el-card class="table-card">
        <el-table v-loading="loading" :data="projectsData" style="width: 100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="objectName" label="项目名称" width="200" />
          <el-table-column prop="type" label="项目类型" width="120">
            <template #default="{ row }">
              {{ row.typeName }}
            </template>
          </el-table-column>
          <el-table-column prop="name" label="负责人" width="150">
            <template #default="{ row }">
              <div class="manager-info">
                <div class="manager-name">{{ row.name || '-' }}</div>
                <div class="manager-details">
                  {{ row.genderName }} · {{ row.age || 0 }}岁
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="项目地址" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.statusId)">{{ row.statusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="150">
            <template #default="{ row }">
              {{ row.endTime ? formatDateTime(row.endTime) : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="investment" label="投资金额" width="150">
            <template #default="{ row }">
              ¥{{ Number(row.investment).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column prop="annualRevenue" label="年收入" width="150">
            <template #default="{ row }">
              ¥{{ Number(row.annualRevenue).toLocaleString() }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" v-if="isAdmin">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleViewDetail(row)">详情</el-button>
              <el-button link type="success" @click="handleEditProject(row)">编辑</el-button>
              <el-button link type="danger" @click="handleDeleteProject(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>
    </template>
    
    <!-- 项目详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="项目详情"
      width="800px"
      :before-close="handleDetailClose"
      class="detail-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="detail-scroll-container" v-if="selectedProject">
        <div class="detail-container">
          <!-- 项目基本信息 -->
          <div class="detail-info-section">
            <div class="detail-form-container">
              <div class="detail-form">
                <div class="detail-form-row">
                  <div class="detail-form-label">项目名称</div>
                  <div class="detail-form-value">{{ selectedProject.objectName }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">负责人姓名</div>
                  <div class="detail-form-value">{{ selectedProject.name }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">负责人年龄</div>
                  <div class="detail-form-value">{{ selectedProject.age }}岁</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">负责人性别</div>
                  <div class="detail-form-value">{{ selectedProject.genderName }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">身份证号</div>
                  <div class="detail-form-value">{{ selectedProject.idCard }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">文化程度</div>
                  <div class="detail-form-value">{{ selectedProject.educationName }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">联系方式</div>
                  <div class="detail-form-value">{{ selectedProject.phone }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">项目类型</div>
                  <div class="detail-form-value">
                    <el-tag :type="getProjectTypeTagType(selectedProject.typeId)" size="small">
                      {{ selectedProject.typeName }}
                    </el-tag>
                  </div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">项目状态</div>
                  <div class="detail-form-value">
                    <el-tag :type="getStatusType(selectedProject.statusId)" size="small">
                      {{ selectedProject.statusName }}
                    </el-tag>
                  </div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">项目地址</div>
                  <div class="detail-form-value">{{ selectedProject.address }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">投资金额</div>
                  <div class="detail-form-value">¥{{ Number(selectedProject.investment).toLocaleString() }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">年收入</div>
                  <div class="detail-form-value">¥{{ Number(selectedProject.annualRevenue).toLocaleString() }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">开始时间</div>
                  <div class="detail-form-value">{{ formatDateTime(selectedProject.startTime) }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">结束时间</div>
                  <div class="detail-form-value">{{ selectedProject.endTime ? formatDateTime(selectedProject.endTime) : '未结束' }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">创建时间</div>
                  <div class="detail-form-value">{{ formatDateTime(selectedProject.createTime) }}</div>
                </div>
                <div class="detail-form-row">
                  <div class="detail-form-label">更新时间</div>
                  <div class="detail-form-value">{{ formatDateTime(selectedProject.updateTime) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleEditFromDetail" v-if="isAdmin">编辑</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑项目' : '新增项目'" width="800px">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <el-form-item label="项目名称" prop="objectName">
          <el-input v-model="formData.objectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目负责人" prop="managerResidentId">
          <div class="villager-selector">
            <el-input
              v-model="villagerSearchQuery"
              placeholder="请输入村民姓名进行搜索"
              @input="handleVillagerSearch($event)"
              @focus="villagerSearchVisible = true"
              class="villager-input"
            >
              <template #suffix>
                <el-icon class="search-icon" @click="villagerSearchVisible = true">
                  <Search />
                </el-icon>
              </template>
            </el-input>
            
            <!-- 已选择的村民信息 -->
            <div v-if="selectedVillager && selectedVillager.name" class="selected-villager">
              <div class="villager-info">
                <span class="villager-name">{{ selectedVillager.name || '' }}</span>
                <span class="villager-details">
                  {{ getGenderLabel(selectedVillager.gender) }} · {{ selectedVillager.age || 0 }}岁 · {{ selectedVillager.phone || '' }}
                </span>
              </div>
             <el-button 
               type="text" 
               size="small" 
               @click="clearVillagerSelection"
               class="clear-btn"
             >
               清除
             </el-button>
            </div>
            
            <!-- 村民搜索结果下拉 -->
            <div v-if="villagerSearchVisible && villagerSearchQuery && villagerSearchQuery.trim().length >= 1" class="villager-search-results">
              <div v-if="villagerSearchLoading" class="loading-text">
                <el-icon class="is-loading"><Loading /></el-icon>
                搜索中...
              </div>
              <div v-else-if="villagerSearchResults.length === 0" class="no-results">
                未找到相关村民
              </div>
              <div v-else class="search-list">
                <div 
                  v-for="villager in villagerSearchResults" 
                  :key="villager.id || villager.name"
                  class="search-item"
                  @click="selectVillager(villager)"
                >
                  <div class="item-info">
                    <span class="item-name">{{ villager.name || '' }}</span>
                    <span class="item-details">
                      {{ getGenderLabel(villager.gender) }} · {{ villager.age || 0 }}岁 · {{ villager.phone || '' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-form-item>
        <el-form-item label="项目类型" prop="typeId">
          <el-select v-model="formData.typeId" placeholder="请选择项目类型" clearable>
            <el-option 
              v-for="option in projectTypeOptions" 
              :key="option.id" 
              :label="option.name" 
              :value="option.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入项目地址" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="投资金额" prop="investment">
            <el-input v-model.number="formData.investment" placeholder="请输入投资金额">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
          <el-form-item label="年收入" prop="annualRevenue">
            <el-input v-model.number="formData.annualRevenue" placeholder="请输入年收入">
              <template #prefix>¥</template>
            </el-input>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="项目状态" prop="statusId">
            <el-select v-model="formData.statusId" placeholder="请选择项目状态" clearable>
              <el-option 
                v-for="option in projectStatusOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="开始时间" prop="startDate">
            <el-date-picker v-model="formData.startDate" type="date" placeholder="请选择开始时间" />
          </el-form-item>
          <el-form-item label="结束时间" prop="endDate">
            <el-date-picker v-model="formData.endDate" type="date" placeholder="请选择结束时间" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出数据对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出集体经济数据"
      width="500px"
      :before-close="handleExportClose"
      class="export-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="export-container">
        <div class="export-info">
          <el-icon class="export-icon"><Download /></el-icon>
          <div class="export-text">
            <h3>数据导出</h3>
            <p>将导出当前筛选条件下的所有集体经济项目数据</p>
          </div>
        </div>
        <div class="export-actions">
          <el-button type="primary" @click="handleSelectPath" :loading="exportLoading" size="large">
            <el-icon><Download /></el-icon>
            选择路径导出
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 路径选择对话框 -->
    <el-dialog
      v-model="pathDialogVisible"
      title="选择导出路径"
      width="600px"
      :before-close="handlePathClose"
      class="path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="pathForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <div class="path-input-group">
                <el-input
                  v-model="pathForm.directory"
                  placeholder="请选择保存目录"
                  class="path-input"
                  readonly
                  @click="handleSelectDirectory"
                />
                <el-button @click="handleSelectDirectory" type="primary">
                  <el-icon><FolderOpened /></el-icon>
                  浏览文件夹
                </el-button>
              </div>
              <div class="path-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径</span>
              </div>
            </el-form-item>
            <el-form-item label="文件名" required>
              <el-input
                v-model="pathForm.filename"
                placeholder="请输入文件名（不含扩展名）"
                @input="handleFilenameChange"
              />
              <div class="filename-preview">
                完整路径：{{ fullPath }}
              </div>
            </el-form-item>
            <el-form-item label="工作表名称">
              <el-input
                v-model="pathForm.sheetName"
                placeholder="请输入工作表名称"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handlePathClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Plus, List, Money, PieChart, Filter, Refresh, InfoFilled, ArrowDown, ArrowUp, Briefcase, Calendar, User, Loading, Download, FolderOpened, TrendCharts, DataAnalysis } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { economyAPI, residentAPI, dictAPI } from '../../api/api.js'
import * as echarts from 'echarts'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 导出路径预览
const fullPath = computed(() => {
  if (!pathForm.directory || !pathForm.filename) {
    return ''
  }
  const directory = pathForm.directory.endsWith('\\') || pathForm.directory.endsWith('/') 
    ? pathForm.directory 
    : pathForm.directory + '\\'
  return `${directory}${pathForm.filename}.xlsx`
})

// 视图相关
const currentView = ref('dashboard')
const showFullInfo = ref(true)
const searchExpanded = ref(false)

// 搜索相关
const searchForm = reactive({
  objectName: '',
  typeId: null,
  statusId: null,
  managerName: '',
  address: '',
  minInvestment: '',
  maxInvestment: '',
  minAnnualRevenue: '',
  maxAnnualRevenue: '',
  startDate: '',
  endDate: '',
  minAge: '',
  maxAge: '',
  genderId: null
})

// 表格数据相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const projectsData = ref([])

// 统计数据
const projectCount = ref(0)
const totalInvestment = ref(0)
const totalIncome = ref(0)
const averageReturnRate = ref(0)
const recentProjectsData = ref([])

// 详情对话框相关
const detailDialogVisible = ref(false)
const selectedProject = ref(null)

// 村民选择相关
const villagerSearchVisible = ref(false)
const villagerSearchQuery = ref('')
const villagerSearchResults = ref([])
const villagerSearchLoading = ref(false)
const selectedVillager = ref(null)

// 字典类型和字典数据
const dictTypeList = ref([])
const dictDataMap = ref(new Map()) // 存储每个类型的字典数据

// 表单字段与字典类型的映射
const fieldToDictTypeMap = {
  'typeId': 'economy_type',      // 项目类型
  'statusId': 'economy_status',  // 项目状态
  'genderId': 'gender'            // 性别
}

// 枚举选项数据 - 从字典动态获取
const projectTypeOptions = ref([])
const projectStatusOptions = ref([])
const genderOptions = ref([])

// 图表相关
const typeChartRef = ref(null)
const investmentChartRef = ref(null)
const returnRateChartRef = ref(null)
let typeChart = null
let investmentChart = null
let returnRateChart = null

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)

// 路径选择相关
const pathDialogVisible = ref(false)
const pathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '集体经济数据'
})

// 表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref(null)
const formData = reactive({
  id: null,                    // 项目ID（编辑时使用）
  objectName: '',              // 项目名称
  managerResidentId: null,     // 项目负责人ID
  typeId: null,                // 项目类型（Integer，字典ID）
  investment: null,            // 项目投资（BigDecimal -> Number）
  annualRevenue: null,         // 项目年收入（BigDecimal -> Number）
  address: '',                 // 项目地址
  statusId: null,              // 项目状态（Integer，字典ID）
  startDate: null,             // 开始时间（Date）
  endDate: null                // 结束时间（Date）
})

// 表单验证规则
const formRules = {
  objectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' }
  ],
  managerResidentId: [
    { required: true, message: '请选择项目负责人', trigger: 'change' }
  ],
  typeId: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入项目地址', trigger: 'blur' }
  ],
  investment: [
    { required: true, message: '请输入投资金额', trigger: 'blur' },
    { type: 'number', min: 0, message: '投资金额必须大于等于0', trigger: 'blur' }
  ],
  annualRevenue: [
    { required: true, message: '请输入年收入', trigger: 'blur' },
    { type: 'number', min: 0, message: '年收入必须大于等于0', trigger: 'blur' }
  ],
  statusId: [
    { required: true, message: '请选择项目状态', trigger: 'change' }
  ],
  startDate: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ]
}

// ==================== 字典数据加载函数 ====================

// 根据表单字段加载对应的字典数据
const loadDictDataForField = async (fieldName) => {
  const dictType = fieldToDictTypeMap[fieldName]
  if (!dictType) {
    console.log(`字段 ${fieldName} 没有对应的字典类型`)
    return []
  }
  
  try {
    console.log(`开始加载字段 ${fieldName} 对应的字典数据，类型: ${dictType}`)
    
    const response = await dictAPI.getDictDataByTypeCode(dictType)
    console.log(`字段 ${fieldName} 字典数据API响应:`, response)
    
    if (response && response.code === 200) {
      const data = response.data || []
      console.log(`获取到的字典数据:`, data)
      
      // 转换为选项格式 - 使用数字ID
      const options = data.map(item => ({
        id: item.id,  // 使用数字ID
        name: item.dictLabel
      }))
      
      console.log(`字段 ${fieldName} 转换后的选项:`, options)
      return options
    } else {
      console.warn(`字段 ${fieldName} 字典数据API返回异常:`, response)
      return []
    }
  } catch (error) {
    console.error(`加载字段 ${fieldName} 字典数据失败:`, error)
    return []
  }
}

// 加载所有需要的字典数据
const loadAllDictData = async () => {
  try {
    console.log('=== 项目页面开始加载字典数据 ===')
    
    // 并行加载所有表单字段对应的字典数据
    const fieldNames = Object.keys(fieldToDictTypeMap)
    console.log('需要加载的字段:', fieldNames)
    
    const promises = fieldNames.map(async (fieldName) => {
      console.log(`开始加载字段: ${fieldName}`)
      const options = await loadDictDataForField(fieldName)
      console.log(`字段 ${fieldName} 加载完成，获取到 ${options.length} 个选项`)
      return { fieldName, options }
    })
    
    console.log('等待所有字段数据加载完成...')
    const results = await Promise.all(promises)
    console.log('所有字段字典数据加载结果:', results)
    
    // 更新对应的选项数据
    results.forEach(({ fieldName, options }) => {
      if (options.length > 0) {
        switch (fieldName) {
          case 'typeId':
            projectTypeOptions.value = options
            console.log(`项目类型选项已更新:`, options)
            break
          case 'statusId':
            projectStatusOptions.value = options
            console.log(`项目状态选项已更新:`, options)
            break
          case 'genderId':
            genderOptions.value = options
            console.log(`性别选项已更新:`, options)
            break
        }
        console.log(`字段 ${fieldName} 选项数据已更新，共 ${options.length} 个选项`)
      } else {
        console.warn(`字段 ${fieldName} 没有获取到数据，将使用备用数据`)
      }
    })
    
    // 检查是否有字段没有数据，如果有则使用备用数据
    const hasEmptyFields = results.some(({ options }) => options.length === 0)
    if (hasEmptyFields) {
      console.log('部分字段没有数据，使用备用数据填充')
      loadFallbackData()
    }
    
    console.log('=== 项目页面所有字典数据加载完成 ===')
    console.log('最终选项数据:')
    console.log('- 项目类型:', projectTypeOptions.value.length, '个选项')
    console.log('- 项目状态:', projectStatusOptions.value.length, '个选项')
    console.log('- 性别:', genderOptions.value.length, '个选项')
    
  } catch (error) {
    console.error('加载字典数据失败:', error)
    // 如果字典API失败，使用备用数据
    console.log('使用备用数据确保功能正常')
    loadFallbackData()
  }
}

// 备用数据（当字典API失败时使用）
const loadFallbackData = () => {
  console.log('使用备用数据...')
  if (projectTypeOptions.value.length === 0) {
    projectTypeOptions.value = [
      { id: 15, name: '种植' },
      { id: 16, name: '养殖' },
      { id: 17, name: '加工' },
      { id: 18, name: '旅游' },
      { id: 19, name: '其他' }
    ]
  }
  
  if (projectStatusOptions.value.length === 0) {
    projectStatusOptions.value = [
      { id: 20, name: '运营' },
      { id: 21, name: '筹备' },
      { id: 22, name: '暂停' },
      { id: 23, name: '终止' }
    ]
  }
  
  if (genderOptions.value.length === 0) {
    genderOptions.value = [
      { id: 29, name: '男' },
      { id: 30, name: '女' }
    ]
  }
  console.log('备用数据加载完成')
}

// ==================== 辅助函数 ====================

// 获取项目类型标签
const getProjectTypeLabel = (type) => {
  const labels = {
    'PLANTING': '种植',
    'BREEDING': '养殖',
    'PROCESSING': '加工',
    'TOURISM': '旅游',
    'OTHER': '其他'
  }
  return labels[type] || type
}

// 获取项目类型标签颜色
const getProjectTypeTagType = (typeId) => {
  const types = {
    15: 'success',  // 种植
    16: 'primary',  // 养殖
    17: 'warning',  // 加工
    18: 'info',     // 旅游
    19: 'default'   // 其他
  }
  return types[typeId] || 'default'
}

// 获取状态标签
const getStatusLabel = (status) => {
  const labels = {
    'PREPARING': '筹备',
    'OPERATING': '运营',
    'PAUSED': '暂停',
    'TERMINATED': '终止'
  }
  return labels[status] || status
}

// 获取状态类型
const getStatusType = (statusId) => {
  const types = {
    20: 'success',  // 运营
    21: 'info',     // 筹备
    22: 'warning',  // 暂停
    23: 'danger'    // 终止
  }
  return types[statusId] || 'default'
}

// 获取性别标签
const getGenderLabel = (gender) => {
  const labels = {
    'MALE': '男',
    'FEMALE': '女'
  }
  return labels[gender] || gender
}

// 获取文化程度标签
const getEducationLabel = (education) => {
  const labels = {
    'ILLITERATE': '文盲',
    'PRIMARY': '小学',
    'SECONDARY': '初中',
    'SENIOR': '高中',
    'COLLEGE': '大专',
    'BACHELOR': '本科',
    'MASTER': '硕士',
    'DOCTOR': '博士'
  }
  return labels[education] || education
}

// 村民搜索相关方法
const searchVillagers = async (query) => {
  if (!query || query.trim().length < 1) {
    villagerSearchResults.value = []
    return
  }
  
  villagerSearchLoading.value = true
  try {
    const response = await residentAPI.getResidentList({
      name: query.trim(),
      pageNum: 1,
      pageSize: 10
    })
    
    if (response && response.code === 200 && response.data) {
      const villagers = response.data.list || []
      villagerSearchResults.value = villagers
    } else {
      villagerSearchResults.value = []
    }
  } catch (error) {
    console.error('搜索村民失败:', error)
    villagerSearchResults.value = []
  } finally {
    villagerSearchLoading.value = false
  }
}

const handleVillagerSearch = (query) => {
  villagerSearchQuery.value = query
  
  if (query && query.trim().length >= 1) {
    villagerSearchVisible.value = true
    searchVillagers(query)
  } else {
    villagerSearchVisible.value = false
    villagerSearchResults.value = []
  }
}

const selectVillager = (villager) => {
  if (villager && villager.id) {
    selectedVillager.value = villager
    formData.managerResidentId = villager.id
    villagerSearchVisible.value = false
    villagerSearchQuery.value = ''
    villagerSearchResults.value = []
  }
}

const clearVillagerSelection = () => {
  selectedVillager.value = null
  formData.managerResidentId = null
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const timestamp = typeof dateTime === 'number' ? dateTime : new Date(dateTime).getTime()
  return new Date(timestamp).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 切换显示模式
const toggleDisplayMode = () => {
  showFullInfo.value = !showFullInfo.value
}

// 切换搜索展开状态
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

// 切换到表格视图
const switchToTableView = async () => {
  currentView.value = 'table'
  // 确保在下一个tick后加载数据，避免视图切换和数据加载的时序问题
  await nextTick()
  await loadTableData()
}

// 处理视图切换
const handleViewChange = async () => {
  await nextTick()
  if (currentView.value === 'table') {
    await loadTableData()
  } else {
    await loadStatsData()
    await initCharts()
  }
}

// 加载统计数据
const loadStatsData = async () => {
  try {
    const queryData = {
      pageNum: 1,
      pageSize: 1000,
      ...cleanSearchForm(searchForm)
    }
    
    const response = await economyAPI.getEconomyList(queryData)
    if (response.code === 200) {
      const data = response.data.list || []
      
      projectCount.value = data.length
      totalInvestment.value = data.reduce((sum, item) => sum + Number(item.investment || 0), 0)
      totalIncome.value = data.reduce((sum, item) => sum + Number(item.annualRevenue || 0), 0)
      
      const validProjects = data.filter(item => Number(item.investment) > 0)
      if (validProjects.length > 0) {
        const totalReturn = validProjects.reduce((sum, item) => {
          const investment = Number(item.investment)
          const revenue = Number(item.annualRevenue)
          return sum + (investment > 0 ? (revenue / investment) * 100 : 0)
        }, 0)
        averageReturnRate.value = (totalReturn / validProjects.length).toFixed(1)
      }
      
      recentProjectsData.value = [...data]
        .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, 5)
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 清理搜索表单数据，只保留有值的字段
const cleanSearchForm = (form) => {
  const cleaned = {}
  Object.keys(form).forEach(key => {
    const value = form[key]
    // 只保留有实际值的字段
    if (value !== '' && value !== null && value !== undefined && value !== 0) {
      // 对于数字类型，确保不是0
      if (typeof value === 'number' && value === 0) {
        return
      }
      // 对于字符串类型，确保不是空字符串或只包含空格
      if (typeof value === 'string' && value.trim() === '') {
        return
      }
      cleaned[key] = value
    }
  })
  return cleaned
}

// 加载表格数据
const loadTableData = async () => {
  loading.value = true
  
  try {
    const queryData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      ...cleanSearchForm(searchForm)
    }
    
    const response = await economyAPI.getEconomyList(queryData)
    if (response.code === 200) {
      projectsData.value = response.data.list || []
      total.value = response.data.total || 0
    } else {
      ElMessage.error(response.message || '获取项目列表失败')
    }
  } catch (error) {
    console.error('加载表格数据失败:', error)
    ElMessage.error('加载表格数据失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  loadTableData()
}

const handleAdvancedSearch = () => {
  currentPage.value = 1
  loadTableData()
}

const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  currentPage.value = 1
  loadTableData()
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  loadTableData()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  loadTableData()
}

// 查看项目详情
const handleViewDetail = async (row) => {
  try {
    const response = await economyAPI.getEconomyInfo(row.id)
    if (response.code === 200) {
      selectedProject.value = response.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取项目详情失败')
    }
  } catch (error) {
    console.error('获取项目详情失败:', error)
    ElMessage.error('获取项目详情失败')
  }
}

// 关闭详情对话框
const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedProject.value = null
}

// 从详情页面编辑
const handleEditFromDetail = () => {
  if (selectedProject.value) {
    handleEditProject(selectedProject.value)
    detailDialogVisible.value = false
  }
}

// 新增项目
const handleAddProject = () => {
  isEdit.value = false
  // 重置表单数据为初始值
  Object.keys(formData).forEach(key => {
    if (key === 'id') {
      formData[key] = null
    } else if (key === 'managerResidentId') {
      formData[key] = null
    } else if (key === 'typeId' || key === 'statusId') {
      formData[key] = null  // 枚举字段设为null
    } else if (key === 'investment' || key === 'annualRevenue') {
      formData[key] = null  // 数字字段设为null
    } else if (key === 'startDate' || key === 'endDate') {
      formData[key] = null  // 日期字段设为null
    } else {
      formData[key] = ''    // 字符串字段设为空字符串
    }
  })
  // 清空村民选择
  selectedVillager.value = null
  villagerSearchQuery.value = ''
  villagerSearchResults.value = []
  villagerSearchVisible.value = false
  dialogVisible.value = true
}

// 编辑项目
const handleEditProject = async (row) => {
  try {
    const response = await economyAPI.getEconomyInfo(row.id)
    if (response.code === 200) {
      Object.assign(formData, response.data)
      
      // 处理时间字段
      if (formData.startTime) {
        const timestamp = typeof formData.startTime === 'number' ? formData.startTime : new Date(formData.startTime).getTime()
        formData.startDate = new Date(timestamp)
      }
      if (formData.endTime) {
        const timestamp = typeof formData.endTime === 'number' ? formData.endTime : new Date(formData.endTime).getTime()
        formData.endDate = new Date(timestamp)
      }
      
      // 处理负责人信息
      console.log('编辑项目响应数据:', response.data)
      console.log('formData.managerResidentId:', formData.managerResidentId)
      
      // 响应数据中直接包含负责人信息，直接使用
      if (response.data.name) {
        console.log('使用响应数据中的负责人信息:', response.data.name)
        
        // 检查响应数据中是否有managerResidentId字段
        const managerId = response.data.managerResidentId || response.data.managerId || response.data.id
        
        selectedVillager.value = {
          id: managerId,
          name: response.data.name,
          age: response.data.age,
          gender: response.data.gender,
          phone: response.data.phone,
          idCard: response.data.idCard,
          educationLevel: response.data.educationLevel
        }
        villagerSearchQuery.value = response.data.name
        
        // 设置managerResidentId
        formData.managerResidentId = managerId
        console.log('设置的managerResidentId:', formData.managerResidentId)
      } else {
        console.log('响应数据中没有负责人信息')
        selectedVillager.value = null
        villagerSearchQuery.value = ''
      }
      
  isEdit.value = true
  dialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取项目详情失败')
    }
  } catch (error) {
    console.error('获取项目详情失败:', error)
    ElMessage.error('获取项目详情失败')
  }
}

// 删除项目
const handleDeleteProject = (row) => {
  ElMessageBox.confirm(
    `确定要删除项目 "${row.objectName}" 吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await economyAPI.deleteEconomy(row.id)
      if (response.code === 200) {
    ElMessage.success('删除成功')
    loadTableData()
        if (currentView.value === 'dashboard') {
          loadStatsData()
        }
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除项目失败:', error)
      ElMessage.error('删除项目失败')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitLoading.value = true
    
    const submitData = { ...formData }
    
    // 编辑时移除响应数据中的负责人信息字段，保留VillageEconomyInfoForm需要的字段
    if (isEdit.value) {
      // 只保留VillageEconomyInfoForm中定义的字段
      const allowedFields = ['id', 'objectName', 'managerResidentId', 'typeId', 'investment', 'annualRevenue', 'address', 'statusId', 'startDate', 'endDate', 'createTime', 'updateTime']
      const filteredData = {}
      allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(submitData, field)) {
          filteredData[field] = submitData[field]
        }
      })
      // 完全替换submitData，而不是合并
      Object.keys(submitData).forEach(key => delete submitData[key])
      Object.assign(submitData, filteredData)
    }
    
    // 确保数字字段为数字类型（Integer 和 BigDecimal）
    if (submitData.managerResidentId) {
      submitData.managerResidentId = Number(submitData.managerResidentId)
    }
    if (submitData.typeId) {
      submitData.typeId = Number(submitData.typeId)
    }
    if (submitData.statusId) {
      submitData.statusId = Number(submitData.statusId)
    }
    if (submitData.investment) {
      submitData.investment = Number(submitData.investment)
    }
    if (submitData.annualRevenue) {
      submitData.annualRevenue = Number(submitData.annualRevenue)
    }
    
    // 处理日期字段 - 转换为 yyyy-MM-dd 格式
    if (submitData.startDate) {
      const date = new Date(submitData.startDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      submitData.startDate = `${year}-${month}-${day}`
    }
    if (submitData.endDate) {
      const date = new Date(submitData.endDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      submitData.endDate = `${year}-${month}-${day}`
    }
    
    console.log('准备提交的项目数据:', submitData)
    console.log('字段类型检查:')
    console.log('- typeId (项目类型):', submitData.typeId, typeof submitData.typeId)
    console.log('- statusId (项目状态):', submitData.statusId, typeof submitData.statusId)
    console.log('- investment (投资金额):', submitData.investment, typeof submitData.investment)
    console.log('- annualRevenue (年收入):', submitData.annualRevenue, typeof submitData.annualRevenue)
    
    let response
    if (isEdit.value) {
      response = await economyAPI.updateEconomy(submitData)
    } else {
      response = await economyAPI.addEconomy(submitData)
    }
    
    if (response.code === 200) {
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    dialogVisible.value = false
    loadTableData()
      if (currentView.value === 'dashboard') {
        loadStatsData()
      }
    } else {
      ElMessage.error(response.message || (isEdit.value ? '编辑失败' : '新增失败'))
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('提交失败')
  } finally {
    submitLoading.value = false
  }
}

// 点击外部关闭搜索结果
const handleClickOutside = (event) => {
  if (!event.target.closest('.villager-selector')) {
    villagerSearchVisible.value = false
    // 如果输入框为空，清空搜索结果
    if (!villagerSearchQuery.value || villagerSearchQuery.value.trim().length < 1) {
      villagerSearchResults.value = []
    }
  }
}

// 导出相关方法
const handleExport = async () => {
  exportDialogVisible.value = true
}

const handleSelectPath = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  pathForm.filename = `集体经济数据导出_${timestamp}`
  pathForm.sheetName = '集体经济数据'
  pathDialogVisible.value = true
}

const handleExportClose = () => {
  exportDialogVisible.value = false
}

const handlePathClose = () => {
  pathDialogVisible.value = false
}

const handleSelectDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showPathInputDialog()
}

const showPathInputDialog = () => {
  // 创建自定义的路径选择对话框
  ElMessageBox({
    title: '选择保存目录',
    message: '由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'path-select-dialog',
    showInput: true,
    inputValue: pathForm.directory || 'D:\\',
    inputPlaceholder: '例如：D:\\Documents\\Exports',
    inputType: 'textarea',
    inputValidator: (value) => {
      if (!value || value.trim() === '') {
        return '请输入有效的目录路径'
      }
      // 简单的路径格式验证
      const trimmedValue = value.trim()
      if (trimmedValue.includes('..') || trimmedValue.includes('//')) {
        return '请输入正确的目录路径'
      }
      return true
    },
    beforeClose: (action, instance, done) => {
      if (action === 'confirm') {
        const value = instance.inputValue
        if (value) {
          const trimmedPath = value.trim()
          // 确保路径格式正确
          let finalPath = trimmedPath
          if (finalPath.endsWith('\\') || finalPath.endsWith('/')) {
            finalPath = finalPath.slice(0, -1)
          }
          pathForm.directory = finalPath
        }
      }
      done()
    }
  })
}

const handleFilenameChange = () => {
  // 文件名变化时的处理逻辑
  // 可以在这里添加文件名验证等逻辑
}

const handleConfirmExport = async () => {
  try {
    exportLoading.value = true
    
    // 验证表单
    if (!pathForm.directory || !pathForm.filename) {
      ElMessage.error('请填写完整的保存路径和文件名')
      return
    }
    
    // 准备导出参数
    const exportRequest = {
      savepath: fullPath.value,
      sheetName: pathForm.sheetName
    }
    
    // 准备查询参数（使用当前搜索条件）
    const queryRequest = {
      pageNum: 1,
      pageSize: 10000, // 导出所有数据
      ...cleanSearchForm(searchForm)
    }
    
    console.log('导出参数:', exportRequest)
    console.log('查询参数:', queryRequest)
    
    // 调用后端导出接口
    const response = await economyAPI.exportEconomy(exportRequest, queryRequest)
    
    if (response.code === 200) {
      ElMessage.success(`Excel文件已导出到：${fullPath.value}`)
      pathDialogVisible.value = false
      exportDialogVisible.value = false
    } else {
      ElMessage.error(response.message || '导出Excel失败')
    }
  } catch (error) {
    console.error('导出Excel失败:', error)
    ElMessage.error('导出Excel失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

// 图表相关方法
const initCharts = async () => {
  await nextTick()
  await loadChartData()
}

const loadChartData = async () => {
  try {
    // 获取所有项目数据用于图表展示
    const queryData = {
      pageNum: 1,
      pageSize: 1000
    }
    
    const response = await economyAPI.getEconomyList(queryData)
    console.log('图表数据API响应:', response)
    
    if (response.code === 200) {
      const data = response.data.list || []
      console.log('图表原始数据:', data)
      console.log('第一条数据示例:', data[0])
      
      // 项目类型分布数据
      initTypeChart(data)
      
      // 投资金额排行数据（取前10）
      const sortedByInvestment = [...data].sort((a, b) => Number(b.investment || 0) - Number(a.investment || 0))
      initInvestmentChart(sortedByInvestment.slice(0, 10))
      
      // 投资回报率分析数据
      initReturnRateChart(data)
    }
  } catch (error) {
    console.error('加载图表数据失败:', error)
  }
}

const initTypeChart = (data) => {
  if (typeChart) typeChart.dispose()
  
  typeChart = echarts.init(typeChartRef.value)
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (typeChart) {
      typeChart.resize()
    }
  })
  
  // 统计项目类型分布（使用 typeId 和 typeName）
  const typeStats = {}
  const typeNames = {}
  
  data.forEach(project => {
    const typeId = project.typeId
    const typeName = project.typeName || '未知'
    
    if (typeId) {
      typeStats[typeId] = (typeStats[typeId] || 0) + 1
      typeNames[typeId] = typeName
    }
  })
  
  console.log('项目类型统计数据:', typeStats)
  console.log('项目类型名称映射:', typeNames)
  
  // 将统计数据转换为图表数据格式
  const chartData = Object.keys(typeStats).map(typeId => ({
    value: typeStats[typeId],
    name: typeNames[typeId]
  }))
  
  // 提取所有类型名称用于图例
  const legendData = chartData.map(item => item.name)
  
  console.log('饼图数据:', chartData)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: legendData
    },
    series: [{
      name: '项目类型',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: chartData,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  typeChart.setOption(option)
}

const initInvestmentChart = (data) => {
  if (investmentChart) investmentChart.dispose()
  
  investmentChart = echarts.init(investmentChartRef.value)
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (investmentChart) {
      investmentChart.resize()
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const item = params[0]
        return `${item.name}<br/>投资金额: ¥${item.value.toLocaleString()}`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.objectName.length > 8 ? item.objectName.substring(0, 8) + '...' : item.objectName),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '投资金额(元)',
      axisLabel: {
        formatter: function(value) {
          return (value / 10000).toFixed(0) + '万'
        }
      }
    },
    series: [{
      name: '投资金额',
      type: 'bar',
      data: data.map(item => item.investment),
      itemStyle: {
        color: '#409eff'
      }
    }]
  }
  investmentChart.setOption(option)
}

const initReturnRateChart = (data) => {
  if (returnRateChart) returnRateChart.dispose()
  
  returnRateChart = echarts.init(returnRateChartRef.value)
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (returnRateChart) {
      returnRateChart.resize()
    }
  })
  
  // 计算投资回报率
  const returnRateData = data.map(project => {
    const returnRate = project.investment > 0 
      ? (project.annualRevenue / project.investment * 100).toFixed(1)
      : 0
    
    return {
      name: project.objectName,
      investment: project.investment,
      revenue: project.annualRevenue,
      returnRate: parseFloat(returnRate),
      type: project.type
    }
  }).filter(item => item.returnRate > 0).sort((a, b) => b.returnRate - a.returnRate).slice(0, 15)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params) {
        const item = params[0]
        const data = returnRateData[item.dataIndex]
        return `${item.name}<br/>投资金额: ¥${data.investment.toLocaleString()}<br/>年收入: ¥${data.revenue.toLocaleString()}<br/>回报率: ${data.returnRate}%`
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      bottom: '15%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: returnRateData.map(item => item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '回报率(%)'
    },
    series: [{
      name: '投资回报率',
      type: 'bar',
      data: returnRateData.map(item => item.returnRate),
      itemStyle: {
        color: function(params) {
          const rate = params.value
          if (rate >= 20) return '#67c23a'
          if (rate >= 10) return '#e6a23c'
          return '#f56c6c'
        }
      }
    }]
  }
  returnRateChart.setOption(option)
}

// 清理图表和事件监听器
const cleanup = () => {
  if (typeChart) {
    typeChart.dispose()
    typeChart = null
  }
  if (investmentChart) {
    investmentChart.dispose()
    investmentChart = null
  }
  if (returnRateChart) {
    returnRateChart.dispose()
    returnRateChart = null
  }
  window.removeEventListener('resize', () => {})
  document.removeEventListener('click', handleClickOutside)
}

// 组件挂载时加载数据
onMounted(async () => {
  // 先加载字典数据
  await loadAllDictData()
  
  await nextTick()
  if (currentView.value === 'table') {
    await loadTableData()
  } else {
    await loadStatsData()
    await initCharts()
  }
  // 添加点击外部关闭搜索结果的监听
  document.addEventListener('click', handleClickOutside)
})

// 组件卸载时清理
onUnmounted(() => {
  cleanup()
})
</script>

<style scoped>
.projects-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 筛选卡片样式 */
.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.search-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.display-toggle-btn,
.toggle-btn {
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.3s;
}

.display-toggle-btn.active {
  background-color: #409eff;
  color: white;
}

.quick-search {
  margin-bottom: 16px;
}

.quick-search-form {
  margin: 0;
}

.search-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-btn,
.reset-btn {
  padding: 10px 20px;
}

.detailed-search {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
}

.filter-form {
  margin: 0;
}

.filter-section {
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-input,
.form-select,
.form-date-picker {
  width: 100%;
}

.range-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-input {
  flex: 1;
}

.range-separator {
  color: #909399;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-tabs {
  margin-right: 20px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  height: 100%;
}

.stat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-text {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin: 0 0 8px 0;
}

.stat-value {
  font-size: 24px;
  color: #303133;
  margin: 0;
  font-weight: 600;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
}

/* 图表区域样式 */
.charts-section {
  margin-bottom: 20px;
}

.chart-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-row:last-child {
  margin-bottom: 0;
}

.chart-card {
  height: 380px;
  overflow: hidden;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.chart-container {
  height: 320px;
  width: 100%;
  overflow: hidden;
  padding: 10px;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-content {
  height: calc(100% - 40px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-placeholder {
  text-align: center;
  color: #909399;
}

.chart-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

/* 最近项目样式 */
.recent-projects {
  margin-bottom: 20px;
}

.recent-projects-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.project-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-color: #409eff;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  margin-right: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
}

.info-item .el-icon {
  font-size: 14px;
  color: #909399;
}

.project-manager {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.project-manager .el-icon {
  font-size: 14px;
  color: #909399;
}

/* 表格卡片样式 */
.table-card {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.el-table {
  flex: 1;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 表单样式 */
.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 200px;
}

/* 详情对话框样式 */
.detail-dialog .el-dialog {
  max-height: 90vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.detail-scroll-container {
  max-height: 75vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 0 !important;
}

.detail-container {
  padding: 20px;
}

.detail-info-section {
  margin-bottom: 20px;
}

.detail-form-container {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.detail-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.detail-form-row {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
}

.detail-form-row:last-child {
  border-bottom: none;
}

.detail-form-label {
  font-weight: 600;
  color: #606266;
  min-width: 120px;
  margin-right: 16px;
}

.detail-form-value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

/* 村民选择器样式 */
.villager-selector {
  position: relative;
  width: 100%;
}

.villager-input {
  width: 100%;
}

.search-icon {
  cursor: pointer;
  color: #909399;
  transition: color 0.3s;
}

.search-icon:hover {
  color: #409eff;
}

.selected-villager {
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.villager-info {
  flex: 1;
}

.villager-name {
  font-weight: 600;
  color: #303133;
  margin-right: 8px;
}

.villager-details {
  font-size: 12px;
  color: #909399;
}

.clear-btn {
  padding: 4px 8px;
  font-size: 12px;
}

.villager-search-results {
  position: absolute !important;
  top: 100% !important;
  left: 0 !important;
  right: 0 !important;
  background: #fff !important;
  border: 1px solid #e4e7ed !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  height: 240px !important;
  max-height: 240px !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  z-index: 1000 !important;
  margin-top: 4px !important;
}

/* 下拉容器滚动条样式 */
.villager-search-results::-webkit-scrollbar {
  width: 6px;
}

.villager-search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.villager-search-results::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.villager-search-results::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.loading-text,
.no-results {
  padding: 12px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 搜索列表样式由外层容器控制滚动 */

.search-item {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s;
  flex-shrink: 0;
}

.search-item:hover {
  background-color: #f5f7fa;
}

.search-item:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.item-details {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    max-width: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-row {
    grid-template-columns: 1fr;
  }
  
  .recent-projects-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .detail-form {
    grid-template-columns: 1fr;
  }
}

/* 超小屏幕 */
@media (max-width: 480px) {
  .recent-projects-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .project-card {
    padding: 12px;
  }
  
  .project-title {
    font-size: 13px;
  }
  
  .info-item {
    font-size: 11px;
  }
}

/* 负责人信息样式 */
.manager-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.manager-name {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.manager-details {
  font-size: 12px;
  color: #909399;
}

/* 导出对话框样式 */
.export-container {
  padding: 20px 0;
  text-align: center;
}

.export-info {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.export-icon {
  font-size: 48px;
  color: #409eff;
  margin-right: 20px;
}

.export-text h3 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
}

.export-text p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.export-actions {
  margin-top: 20px;
}

/* 路径选择对话框样式 */
.path-container {
  padding: 20px 0;
}

.path-form {
  margin-bottom: 30px;
}

.path-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.path-input {
  flex: 1;
}

.path-tips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  font-size: 12px;
  color: #409eff;
}

.path-tips .el-icon {
  margin-top: 2px;
  flex-shrink: 0;
}

.filename-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #606266;
  word-break: break-all;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* 路径选择对话框自定义样式 */
:deep(.path-select-dialog) {
  .el-message-box__content {
    padding: 20px 20px 10px;
  }
  
  .el-message-box__input {
    margin-top: 15px;
  }
  
  .el-textarea__inner {
    min-height: 80px;
    font-family: 'Courier New', monospace;
  }
}
</style>
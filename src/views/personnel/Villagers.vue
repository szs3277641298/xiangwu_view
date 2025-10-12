<template>
  <div class="villagers-container">
    <!-- 筛选条件区域 -->
    <el-card class="filter-card" shadow="never">
      <!-- 搜索头部 -->
      <div class="search-header">
        <div class="search-title">
          <el-icon><Search /></el-icon>
          <span>搜索筛选</span>
        </div>
        <div class="header-actions">
          <el-button 
            type="text" 
            @click="toggleDisplayMode"
            class="display-toggle-btn"
            :class="{ 'active': showFullInfo }"
          >
            <el-icon><InfoFilled /></el-icon>
            {{ showFullInfo ? '简化显示' : '完整显示' }}
          </el-button>
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
              v-model="searchForm.name"
              placeholder="请输入姓名"
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
                <el-icon><User /></el-icon>
                <span>基本信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="姓名">
                  <el-input
                    v-model="searchForm.name"
                    placeholder="请输入姓名"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
              <el-form-item label="身份证号">
                <el-input
                  v-model="searchForm.idCard"
                  placeholder="请输入身份证号"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
              <el-form-item label="居住类型">
                <el-select v-model="searchForm.residenceTypeId" placeholder="请选择" clearable style="width: 120px">
                  <el-option 
                    v-for="option in residenceTypeOptions" 
                    :key="option.id" 
                    :label="option.name" 
                    :value="option.id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="性别">
                <el-select v-model="searchForm.genderId" placeholder="请选择" clearable style="width: 100px">
                  <el-option 
                    v-for="option in genderOptions" 
                    :key="option.id" 
                    :label="option.name" 
                    :value="option.id" 
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="年龄范围">
                <el-input
                  v-model.number="searchForm.minAge"
                  placeholder="最小年龄"
                  type="number"
                  style="width: 100px"
                />
                <span style="margin: 0 8px">-</span>
                <el-input
                  v-model.number="searchForm.maxAge"
                  placeholder="最大年龄"
                  type="number"
                  style="width: 100px"
                />
              </el-form-item>
              </div>
            </div>
            <!-- 联系信息 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Phone /></el-icon>
                <span>联系信息</span>
              </div>
              <div class="form-grid">
                <el-form-item label="地址">
                  <el-input
                    v-model="searchForm.address"
                    placeholder="请输入地址"
                    clearable
                    class="form-input-wide"
                  />
                </el-form-item>
                <el-form-item label="联系电话">
                  <el-input
                    v-model="searchForm.phone"
                    placeholder="请输入联系电话"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="家庭人数">
                  <div class="age-range">
                    <el-input
                      v-model.number="searchForm.minFamilySize"
                      placeholder="最少人数"
                      type="number"
                      class="age-input"
                    />
                    <span class="range-separator">-</span>
                    <el-input
                      v-model.number="searchForm.maxFamilySize"
                      placeholder="最多人数"
                      type="number"
                      class="age-input"
                    />
                  </div>
                </el-form-item>
              </div>
            </div>
            <!-- 经济状况 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Money /></el-icon>
                <span>经济状况</span>
              </div>
              <div class="form-grid">
                <el-form-item label="收入来源">
                  <el-select v-model="searchForm.incomeSourceId" placeholder="请选择" clearable style="width: 120px">
                    <el-option 
                      v-for="option in incomeSourceOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="优抚情况">
                  <el-select v-model="searchForm.welfareStatusId" placeholder="请选择" clearable style="width: 120px">
                    <el-option 
                      v-for="option in welfareStatusOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="社保">
                  <el-select v-model="searchForm.hasSocialSecurity" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="医保">
                  <el-select v-model="searchForm.hasMedicalInsurance" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
              </div>
            </div>
            <!-- 个人状况 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Document /></el-icon>
                <span>个人状况</span>
              </div>
              <div class="form-grid">
                <el-form-item label="婚姻状况">
                  <el-select v-model="searchForm.maritalStatusId" placeholder="请选择" clearable style="width: 120px">
                    <el-option 
                      v-for="option in maritalStatusOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="文化程度">
                  <el-select v-model="searchForm.educationLevelId" placeholder="请选择" clearable style="width: 120px">
                    <el-option 
                      v-for="option in educationOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="职业">
                  <el-input
                    v-model="searchForm.occupation"
                    placeholder="请输入职业"
                    clearable
                    class="form-input"
                  />
                </el-form-item>
                <el-form-item label="政治面貌">
                  <el-select v-model="searchForm.politicalStatusId" placeholder="请选择" clearable style="width: 120px">
                    <el-option 
                      v-for="option in politicalStatusOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
              </div>
            </div>
            
            <!-- 身份状态 -->
            <div class="filter-section">
              <div class="section-title">
                <el-icon><Star /></el-icon>
                <span>身份状态</span>
              </div>
              <div class="form-grid">
                <el-form-item label="健康状况">
                  <el-select v-model="searchForm.healthStatus" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="退役军人">
                  <el-select v-model="searchForm.isVeteran" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="村委会">
                  <el-select v-model="searchForm.isVillageCommittee" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="贫困户">
                  <el-select v-model="searchForm.isPoor" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="残疾人">
                  <el-select v-model="searchForm.isDisabled" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="独生子女">
                  <el-select v-model="searchForm.isOnlyChildFamily" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="军烈属">
                  <el-select v-model="searchForm.isMartyrFamily" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
                <el-form-item label="其他补贴">
                  <el-select v-model="searchForm.hasOtherSubsidy" placeholder="请选择" clearable style="width: 100px">
                    <el-option 
                      v-for="option in yesNoOptions" 
                      :key="option.id" 
                      :label="option.name" 
                      :value="option.id" 
                    />
                  </el-select>
                </el-form-item>
              </div>
            </div>
          </el-form>
        </div>
      </el-collapse-transition>
    </el-card>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="success" v-if="isAdmin" @click="handleBatchImport">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button type="primary" v-if="isAdmin" @click="handleAddVillager">
          <el-icon><Plus /></el-icon>
          新增村民
        </el-button>
        <el-button type="warning" @click="handleExport">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
        <el-button type="info" @click="handleGenerateTemplate">
          <el-icon><Document /></el-icon>
          生成模板
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="total-info">共 {{ total }} 条记录</span>
      </div>
    </div>
    
    <!-- 村民卡片列表 -->
    <div class="villagers-list" v-loading="loading">
      <div class="villager-card" v-for="villager in villagersData" :key="villager.id" @click="handleViewDetail(villager)">
        <!-- 村民照片 -->
        <div class="photo-section">
          <div class="villager-photo" @click.stop="handleImagePreview(villager)">
            <img 
              v-if="villager.photoUrl" 
              :src="villager.photoUrl" 
              :alt="villager.name"
              class="photo-image"
            />
            <el-icon v-else class="photo-placeholder">
              <User />
            </el-icon>
            <div class="photo-overlay">
              <el-icon class="preview-icon">
                <ZoomIn />
              </el-icon>
            </div>
          </div>
        </div>
        
        <!-- 村民信息 -->
        <div class="info-section">
          <!-- 基本信息行 -->
          <div class="info-row primary">
            <div class="name-group">
              <h3 class="villager-name">{{ villager.name }}</h3>
              <div class="basic-info">
                <span class="gender-age">{{ villager.genderLabel }} · {{ villager.age }}岁</span>
                <el-tag 
                  :type="villager.residenceTypeId === 27 ? 'success' : villager.residenceTypeId === 28 ? 'warning' : 'info'" 
                  size="small"
                  class="residence-tag"
                >
                  {{ villager.residenceTypeLabel }}
                </el-tag>
              </div>
            </div>
            <div class="contact-info">
              <div class="phone">{{ villager.phone }}</div>
              <div class="id-card">{{ villager.idCard }}</div>
            </div>
          </div>
          
          <!-- 地址和家庭信息行 -->
          <div class="info-row secondary">
            <div class="address-info">
              <el-icon class="info-icon"><Location /></el-icon>
              <span class="address">{{ villager.address }}</span>
            </div>
            <div class="family-info">
              <span class="family-size">家庭 {{ villager.familySize }} 人</span>
              <span class="income-source">{{ villager.incomeSourceLabel }}</span>
            </div>
          </div>
          
          <!-- 个人详细信息行 -->
          <div class="info-row details" v-if="showFullInfo">
            <div class="detail-group">
              <span class="detail-item" v-if="villager.ethnicity">
                <span class="detail-label">民族：</span>
                <span class="detail-value">{{ villager.ethnicity }}</span>
              </span>
              <span class="detail-item" v-if="villager.maritalStatusLabel">
                <span class="detail-label">婚姻：</span>
                <span class="detail-value">{{ villager.maritalStatusLabel }}</span>
              </span>
              <span class="detail-item" v-if="villager.educationLevelLabel">
                <span class="detail-label">学历：</span>
                <span class="detail-value">{{ villager.educationLevelLabel }}</span>
              </span>
              <span class="detail-item" v-if="villager.politicalStatusLabel">
                <span class="detail-label">政治面貌：</span>
                <span class="detail-value">{{ villager.politicalStatusLabel }}</span>
              </span>
            </div>
            <div class="detail-group">
              <span class="detail-item" v-if="villager.occupation">
                <span class="detail-label">职业：</span>
                <span class="detail-value">{{ villager.occupation }}</span>
              </span>
            </div>
          </div>
          
          <!-- 状态标签行 -->
          <div class="info-row status-row">
            <div class="status-tags">
              <el-tag v-if="villager.hasSocialSecurity === 1" type="success" size="small">社保</el-tag>
              <el-tag v-if="villager.hasMedicalInsurance === 1" type="info" size="small">医保</el-tag>
              <el-tag v-if="villager.welfareStatusLabel && villager.welfareStatusLabel !== '无'" type="warning" size="small">
                {{ villager.welfareStatusLabel }}
              </el-tag>
              <el-tag v-if="villager.healthStatus === 1" type="success" size="small">健康</el-tag>
              <el-tag v-if="villager.healthStatus === 0" type="danger" size="small">不健康</el-tag>
            </div>
          </div>
          
          <!-- 身份标签行 -->
          <div class="info-row identity-row" v-if="showFullInfo">
            <div class="identity-tags">
              <el-tag v-if="villager.isVeteran" type="warning" size="small">退役军人</el-tag>
              <el-tag v-if="villager.isVillageCommittee" type="success" size="small">村委会</el-tag>
              <el-tag v-if="villager.isPoor" type="danger" size="small">贫困户</el-tag>
              <el-tag v-if="villager.isDisabled" type="warning" size="small">残疾人</el-tag>
              <el-tag v-if="villager.isOnlyChildFamily" type="info" size="small">独生子女</el-tag>
              <el-tag v-if="villager.isMartyrFamily" type="danger" size="small">军烈属</el-tag>
              <el-tag v-if="villager.hasOtherSubsidy" type="success" size="small">其他补贴</el-tag>
            </div>
          </div>
          
          
          
          <!-- 备注信息行 -->
          <div class="info-row remarks" v-if="showFullInfo && villager.remarks">
            <div class="remarks-info">
              <span class="remarks-label">备注：</span>
              <span class="remarks-text">{{ villager.remarks }}</span>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="action-section" @click.stop>
          <el-button link type="success" v-if="isAdmin" @click="handleEdit(villager)" class="action-btn">
            <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          <el-button link type="danger" v-if="isAdmin" @click="handleDelete(villager)" class="action-btn">
            <el-icon><Delete /></el-icon>
              删除
            </el-button>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="villagersData.length === 0 && !loading" class="empty-state">
        <el-empty description="暂无村民数据" />
      </div>
    </div>
    
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
    
    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑村民' : '新增村民'" width="900px" class="form-dialog" :center="true">
      <div class="dialog-scroll-container">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <div class="form-row">
          <el-form-item label="姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="性别" prop="genderId">
            <el-select v-model="formData.genderId" placeholder="请选择性别">
              <el-option 
                v-for="option in genderOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年龄" prop="age">
            <el-input v-model.number="formData.age" placeholder="请输入年龄" type="number" />
          </el-form-item>
        </div>
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="formData.idCard" placeholder="请输入身份证号" maxlength="18" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="居住类型" prop="residenceTypeId">
            <el-select v-model="formData.residenceTypeId" placeholder="请选择居住类型">
              <el-option 
                v-for="option in residenceTypeOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="家庭人数" prop="familySize">
            <el-input v-model.number="formData.familySize" placeholder="请输入家庭人数" type="number" />
          </el-form-item>
        </div>
        <el-form-item label="地址" prop="address">
          <el-input v-model="formData.address" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="收入来源" prop="incomeSourceId">
            <el-select v-model="formData.incomeSourceId" placeholder="请选择收入来源">
              <el-option 
                v-for="option in incomeSourceOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="福利状态" prop="welfareStatusId">
            <el-select v-model="formData.welfareStatusId" placeholder="请选择福利状态">
              <el-option 
                v-for="option in welfareStatusOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="社保" prop="hasSocialSecurity">
            <el-switch v-model="formData.hasSocialSecurity" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="医保" prop="hasMedicalInsurance">
            <el-switch v-model="formData.hasMedicalInsurance" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="退役军人" prop="isVeteran">
            <el-switch v-model="formData.isVeteran" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="是否村委" prop="isVillageCommittee">
            <el-switch v-model="formData.isVillageCommittee" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        
        <!-- 新增字段 -->
        <div class="form-row">
          <el-form-item label="婚姻状况" prop="maritalStatusId">
            <el-select v-model="formData.maritalStatusId" placeholder="请选择婚姻状况" clearable>
              <el-option 
                v-for="option in maritalStatusOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="文化程度" prop="educationLevelId">
            <el-select v-model="formData.educationLevelId" placeholder="请选择文化程度" clearable>
              <el-option 
                v-for="option in educationOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
        </div>
        
        <div class="form-row">
          <el-form-item label="民族" prop="ethnicity">
            <el-input v-model="formData.ethnicity" placeholder="请输入民族" />
          </el-form-item>
          <el-form-item label="政治面貌" prop="politicalStatusId">
            <el-select v-model="formData.politicalStatusId" placeholder="请选择政治面貌" clearable>
              <el-option 
                v-for="option in politicalStatusOptions" 
                :key="option.id" 
                :label="option.name" 
                :value="option.id" 
              />
            </el-select>
          </el-form-item>
        </div>
        
        <el-form-item label="职业" prop="occupation">
          <el-input v-model="formData.occupation" placeholder="请输入职业" />
        </el-form-item>
        
        <div class="form-row">
          <el-form-item label="健康状况" prop="healthStatus">
            <el-switch v-model="formData.healthStatus" :active-value="1" :inactive-value="0" active-text="健康" inactive-text="不健康" />
          </el-form-item>
          <el-form-item label="是否贫困户" prop="isPoor">
            <el-switch v-model="formData.isPoor" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="是否残疾人" prop="isDisabled">
            <el-switch v-model="formData.isDisabled" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        
        <div class="form-row">
          <el-form-item label="独生子女家庭" prop="isOnlyChildFamily">
            <el-switch v-model="formData.isOnlyChildFamily" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="军烈属" prop="isMartyrFamily">
            <el-switch v-model="formData.isMartyrFamily" :active-value="1" :inactive-value="0" />
          </el-form-item>
          <el-form-item label="其他补贴" prop="hasOtherSubsidy">
            <el-switch v-model="formData.hasOtherSubsidy" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </div>
        
        <el-form-item label="备注信息">
          <el-input 
            v-model="formData.remarks" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息" 
          />
        </el-form-item>
      </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :disabled="!isAdmin && isEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 批量导入对话框 -->
    <el-dialog v-model="importDialogVisible" title="批量导入村内人员" width="500px">
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
          :on-change="handleImportFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 xlsx/xls 文件，且不超过 10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importLoading">确定导入</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入结果详情对话框 -->
    <ImportResultDialog
      v-model="importResultDialogVisible"
      :result-data="importResultData"
      @refresh="loadData"
    />

    <!-- 图片预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="图片预览"
      width="600px"
      :before-close="handlePreviewClose"
      class="preview-dialog"
      center
    >
      <div class="preview-container">
        <div class="preview-image-wrapper">
          <img 
            v-if="previewImageUrl" 
            :src="previewImageUrl" 
            :alt="previewVillager?.name"
            class="preview-image"
          />
          <div v-else class="preview-placeholder">
            <el-icon class="preview-placeholder-icon">
              <User />
            </el-icon>
            <p>暂无图片</p>
          </div>
        </div>
        <div class="preview-info">
          <h4>{{ previewVillager?.name }}</h4>
          <p>身份证号：{{ previewVillager?.idCard }}</p>
          <p>地址：{{ previewVillager?.address }}</p>
          <div class="preview-actions">
            <el-button size="small" @click="previewDialogVisible = false">关闭</el-button>
            <el-button size="small" type="primary" @click="handleUploadAvatar">
              <el-icon><Upload /></el-icon>
              上传头像
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 图片上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传头像"
      width="450px"
      :before-close="handleUploadClose"
      class="upload-dialog"
      center
    >
      <div class="upload-container">
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileChange"
          :before-upload="beforeImageUpload"
          accept="image/*"
          class="avatar-uploader"
        >
          <div class="upload-area">
            <img v-if="uploadImageUrl" :src="uploadImageUrl" class="upload-preview" />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon">
                <Plus />
              </el-icon>
              <div class="upload-text">
                <p>点击上传图片</p>
                <p class="upload-tip">支持 JPG、PNG 格式，大小不超过 2MB</p>
              </div>
            </div>
          </div>
        </el-upload>
        <div class="upload-actions">
          <el-button size="small" @click="uploadDialogVisible = false">取消</el-button>
          <el-button 
            size="small"
            type="primary" 
            @click="handleConfirmUpload"
            :disabled="!selectedFile"
            :loading="uploading"
          >
            确定上传
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 导出数据对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出村民数据"
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
            <p>将导出当前筛选条件下的所有村民数据</p>
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

    <!-- 模板路径选择对话框 -->
    <el-dialog
      v-model="templatePathDialogVisible"
      title="选择模板保存路径"
      width="600px"
      :before-close="handleTemplatePathClose"
      class="path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="templatePathForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <div class="path-input-group">
                <el-input
                  v-model="templatePathForm.directory"
                  placeholder="请选择保存目录"
                  class="path-input"
                  readonly
                  @click="handleSelectTemplateDirectory"
                />
                <el-button @click="handleSelectTemplateDirectory" type="primary">
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
                v-model="templatePathForm.filename"
                placeholder="请输入文件名（不含扩展名）"
                @input="handleTemplateFilenameChange"
              />
            </el-form-item>
            <el-form-item label="工作表名称" required>
              <el-input
                v-model="templatePathForm.sheetName"
                placeholder="请输入工作表名称"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handleTemplatePathClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmTemplateExport" :loading="exportLoading">
            <el-icon><Download /></el-icon>
            确认导出
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 生成模板路径选择对话框 -->
    <el-dialog
      v-model="generateTemplateDialogVisible"
      title="选择模板文件保存路径"
      width="500px"
      :before-close="handleGenerateTemplateClose"
      class="path-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="path-container">
        <div class="path-form">
          <el-form :model="generateTemplateForm" label-width="120px">
            <el-form-item label="保存路径" required>
              <div class="path-input-group">
                <el-input
                  v-model="generateTemplateForm.directory"
                  placeholder="请选择保存目录"
                  class="path-input"
                  readonly
                  @click="handleSelectGenerateTemplateDirectory"
                />
                <el-button @click="handleSelectGenerateTemplateDirectory" type="primary">
                  <el-icon><FolderOpened /></el-icon>
                  浏览文件夹
                </el-button>
              </div>
              <div class="path-tips">
                <el-icon><InfoFilled /></el-icon>
                <span>由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径</span>
              </div>
            </el-form-item>
          </el-form>
        </div>
        
        <div class="path-actions">
          <el-button @click="handleGenerateTemplateClose">取消</el-button>
          <el-button type="primary" @click="handleConfirmGenerateTemplate" :loading="exportLoading">
            <el-icon><Document /></el-icon>
            确认生成
          </el-button>
        </div>
      </div>
    </el-dialog>

    <!-- 村民详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="村民详情"
      width="800px"
      :before-close="handleDetailClose"
      class="detail-dialog"
      center
      :modal="true"
      :close-on-click-modal="false"
      :close-on-press-escape="true"
    >
      <div class="detail-scroll-container" v-if="selectedVillager">
        <div class="detail-container">
        <!-- 村民照片 -->
        <div class="detail-photo-section">
          <div class="detail-photo" @click="handleImagePreview(selectedVillager)">
            <img 
              v-if="selectedVillager.photoUrl" 
              :src="selectedVillager.photoUrl" 
              :alt="selectedVillager.name"
              class="detail-photo-image"
            />
            <el-icon v-else class="detail-photo-placeholder">
              <User />
            </el-icon>
          </div>
        </div>

        <!-- 村民详细信息表单 -->
        <div class="detail-info-section">
          <!-- <h3 class="detail-title">{{ selectedVillager.name }} 的详细信息</h3> -->
          <div class="detail-form-container">
            <div class="detail-form">
              <div class="detail-form-row">
                <div class="detail-form-label">姓名</div>
                <div class="detail-form-value">{{ selectedVillager.name }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">身份证号</div>
                <div class="detail-form-value">{{ selectedVillager.idCard }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">性别</div>
                <div class="detail-form-value">{{ selectedVillager.genderLabel || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">年龄</div>
                <div class="detail-form-value">{{ selectedVillager.age }}岁</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">居住类型</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.residenceTypeId === 27 ? 'success' : 'warning'" size="small">
                    {{ selectedVillager.residenceTypeLabel || '未填写' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">民族</div>
                <div class="detail-form-value">{{ selectedVillager.ethnicity || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">婚姻状况</div>
                <div class="detail-form-value">{{ selectedVillager.maritalStatusLabel || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">文化程度</div>
                <div class="detail-form-value">{{ selectedVillager.educationLevelLabel || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">政治面貌</div>
                <div class="detail-form-value">{{ selectedVillager.politicalStatusLabel || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">职业</div>
                <div class="detail-form-value">{{ selectedVillager.occupation || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">联系电话</div>
                <div class="detail-form-value">{{ selectedVillager.phone }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">家庭人数</div>
                <div class="detail-form-value">{{ selectedVillager.familySize }}人</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">地址</div>
                <div class="detail-form-value">{{ selectedVillager.address }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">收入来源</div>
                <div class="detail-form-value">{{ selectedVillager.incomeSourceLabel || '未填写' }}</div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">优抚情况</div>
                <div class="detail-form-value">
                  <el-tag v-if="selectedVillager.welfareStatusId && selectedVillager.welfareStatusId !== 36" type="warning" size="small">
                    {{ selectedVillager.welfareStatusLabel || '未填写' }}
                  </el-tag>
                  <span v-else>无</span>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">社保</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.hasSocialSecurity ? 'success' : 'info'" size="small">
                    {{ selectedVillager.hasSocialSecurity ? '已缴纳' : '未缴纳' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">医保</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.hasMedicalInsurance ? 'success' : 'info'" size="small">
                    {{ selectedVillager.hasMedicalInsurance ? '已缴纳' : '未缴纳' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">健康状况</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.healthStatus ? 'success' : 'danger'" size="small">
                    {{ selectedVillager.healthStatus ? '健康' : '不健康' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否退役军人</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.isVeteran ? 'warning' : 'info'" size="small">
                    {{ selectedVillager.isVeteran ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否村委</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.isVillageCommittee ? 'success' : 'info'" size="small">
                    {{ selectedVillager.isVillageCommittee ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否贫困户</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.isPoor ? 'danger' : 'info'" size="small">
                    {{ selectedVillager.isPoor ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否残疾人</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.isDisabled ? 'warning' : 'info'" size="small">
                    {{ selectedVillager.isDisabled ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否独生子女</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.isOnlyChildFamily ? 'info' : 'info'" size="small">
                    {{ selectedVillager.isOnlyChildFamily ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否军烈属</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.isMartyrFamily ? 'danger' : 'info'" size="small">
                    {{ selectedVillager.isMartyrFamily ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row">
                <div class="detail-form-label">是否其他补贴</div>
                <div class="detail-form-value">
                  <el-tag :type="selectedVillager.hasOtherSubsidy ? 'success' : 'info'" size="small">
                    {{ selectedVillager.hasOtherSubsidy ? '是' : '否' }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-form-row" v-if="selectedVillager.participatedProjects">
                <div class="detail-form-label">参与的项目</div>
                <div class="detail-form-value">{{ selectedVillager.participatedProjects }}</div>
              </div>
              <div class="detail-form-row" v-if="selectedVillager.projectPosition">
                <div class="detail-form-label">项目中的职务</div>
                <div class="detail-form-value">{{ selectedVillager.projectPosition }}</div>
              </div>
              <div class="detail-form-row" v-if="selectedVillager.remarks">
                <div class="detail-form-label">备注</div>
                <div class="detail-form-value">{{ selectedVillager.remarks }}</div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { Search, Plus, Upload, Download, UploadFilled, Refresh, User, Location, Briefcase, Edit, Delete, ArrowDown, ArrowUp, ZoomIn, CopyDocument, FolderOpened, InfoFilled, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '../../store/index.js'
import { residentAPI, dictAPI } from '../../api/api.js'
import api from '../../api/api.js'
import ImportResultDialog from '../../components/ImportResultDialog.vue'
import { 
  RESIDENCE_TYPE,
  getResidenceTypeOptions,
  getGenderOptions,
  getIncomeSourceOptions,
  getWelfareStatusOptions,
  getYesNoOptions,
  getResidenceTypeLabel,
  getGenderLabel,
  getIncomeSourceLabel,
  getWelfareStatusLabel,
  getYesNoLabel,
  getPoliticalStatusLabel,
  getEducationLabel,
  getMaritalStatusLabel,
  getMaritalStatusOptions,
  getEducationOptions,
  getPoliticalStatusOptions
} from '../../utils/constants.js'

// 用户状态
const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)

// 计算完整路径
const fullPath = computed(() => {
  if (pathForm.directory && pathForm.filename) {
    const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
    return `${pathForm.directory}/${filename}`
  }
  return ''
})

// 搜索展开状态
const searchExpanded = ref(false)

// 显示模式状态
const showFullInfo = ref(true)

// 详情对话框相关
const detailDialogVisible = ref(false)
const selectedVillager = ref(null)

// 搜索表单 - 与后端 VillageResidentQueryRequest 保持一致
const searchForm = reactive({
  name: '',
  idCard: '',
  residenceTypeId: null,
  minAge: null,
  maxAge: null,
  genderId: null,
  address: '',
  phone: '',
  minFamilySize: null,
  maxFamilySize: null,
  incomeSourceId: null,
  welfareStatusId: null,
  hasSocialSecurity: null,
  hasMedicalInsurance: null,
  isVeteran: null,
  isVillageCommittee: null,
  participatedProjects: '',      // 参与的项目
  projectPosition: '',            // 项目中的职务
  maritalStatusId: null,
  educationLevelId: null,
  ethnicity: '',
  politicalStatusId: null,
  occupation: '',
  healthStatus: null,
  isPoor: null,
  isDisabled: null,
  isOnlyChildFamily: null,
  isMartyrFamily: null,
  hasOtherSubsidy: null,
  remarks: ''                     // 备注信息
})

// 表格数据相关
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const villagersData = ref([])

// 字典类型和字典数据
const dictTypeList = ref([])
const dictDataMap = ref(new Map()) // 存储每个类型的字典数据

// 表单字段与字典类型的映射（根据新的字段名更新）
const fieldToDictTypeMap = {
  'genderId': 'gender',           // 性别
  'residenceTypeId': 'residence_type', // 居住类型
  'incomeSourceId': 'income_source',   // 收入来源
  'welfareStatusId': 'welfare_status', // 福利状态
  'maritalStatusId': 'marital_status', // 婚姻状况
  'educationLevelId': 'education_level', // 学历
  'politicalStatusId': 'political_status' // 政治面貌
}

// 获取所有字典类型
const loadDictTypes = async () => {
  try {
    const response = await dictAPI.getDictTypeList({ page: 1, size: 1000 })
    if (response.code === 200) {
      dictTypeList.value = response.data.list || []
      console.log('获取字典类型成功:', dictTypeList.value)
    }
  } catch (error) {
    console.error('获取字典类型失败:', error)
  }
}

// 根据类型代码获取字典数据
const loadDictDataByType = async (typeCode) => {
  try {
    if (dictDataMap.value.has(typeCode)) {
      console.log(`从缓存获取字典数据 [${typeCode}]:`, dictDataMap.value.get(typeCode))
      return dictDataMap.value.get(typeCode)
    }
    
    console.log(`开始获取字典数据 [${typeCode}]...`)
    const response = await dictAPI.getDictDataByTypeCode(typeCode)
    console.log(`字典API响应 [${typeCode}]:`, response)
    
    if (response && response.code === 200) {
      const data = response.data || []
      dictDataMap.value.set(typeCode, data)
      console.log(`获取字典数据成功 [${typeCode}]:`, data)
      return data
    } else {
      console.warn(`字典API返回异常 [${typeCode}]:`, response)
      return []
    }
  } catch (error) {
    console.error(`获取字典数据失败 [${typeCode}]:`, error)
    return []
  }
}

// 获取所有字典类型
const loadAllDictTypes = async () => {
  try {
    console.log('=== 开始获取所有字典类型 ===')
    console.log('调用API: dictAPI.getDictTypeList')
    console.log('请求参数: { page: 1, size: 1000 }')
    
    const response = await dictAPI.getDictTypeList({ page: 1, size: 1000 })
    console.log('字典类型API响应:', response)
    console.log('响应状态码:', response?.code)
    console.log('响应数据:', response?.data)
    
    if (response && response.code === 200) {
      const types = response.data.list || []
      console.log('获取到的字典类型:', types)
      console.log('字典类型数量:', types.length)
      
      // 更新字典类型选项
      dictTypeOptions.value = types.map(type => ({
        id: type.typeCode,
        name: type.typeName,
        code: type.typeCode
      }))
      
      console.log('字典类型选项设置完成:', dictTypeOptions.value)
      console.log('选项数量:', dictTypeOptions.value.length)
      return types
    } else {
      console.warn('字典类型API返回异常:', response)
      console.log('响应状态码不是200')
      return []
    }
  } catch (error) {
    console.error('获取字典类型失败:', error)
    console.error('错误详情:', error.message)
    console.error('错误堆栈:', error.stack)
    return []
  }
}

// 根据选择的字典类型获取字典数据（简化版本，现在直接在handleDictTypeChange中处理）
const loadDictDataBySelectedType = async (typeCode) => {
  try {
    console.log(`开始获取字典类型 ${typeCode} 的数据...`)
    const response = await dictAPI.getDictDataByTypeCode(typeCode)
    console.log(`字典类型 ${typeCode} API响应:`, response)
    
    if (response && response.code === 200) {
      const data = response.data || []
      console.log(`获取到的字典数据:`, data)
      
      // 转换为选项格式 - 使用数字ID而不是dictValue
      const options = data.map(item => ({
        id: item.id,  // 使用数字ID
        name: item.dictLabel
      }))
      
      console.log(`转换后的选项数据:`, options)
      return options
    } else {
      console.warn(`字典类型 ${typeCode} API返回异常:`, response)
      return []
    }
  } catch (error) {
    console.error(`获取字典类型 ${typeCode} 数据失败:`, error)
    return []
  }
}

// 移除不再需要的字典类型变化处理方法

// 根据表单字段加载对应的字典数据（模仿字典管理页面的逻辑）
const loadDictDataForField = async (fieldName) => {
  const dictType = fieldToDictTypeMap[fieldName]
  if (!dictType) {
    console.log(`字段 ${fieldName} 没有对应的字典类型`)
    return []
  }
  
  try {
    console.log(`开始加载字段 ${fieldName} 对应的字典数据，类型: ${dictType}`)
    console.log(`调用API: dictAPI.getDictDataByTypeCode('${dictType}')`)
    
    const response = await dictAPI.getDictDataByTypeCode(dictType)
    console.log(`字段 ${fieldName} 字典数据API响应:`, response)
    console.log(`响应状态码: ${response?.code}`)
    console.log(`响应数据:`, response?.data)
    
    if (response && response.code === 200) {
      const data = response.data || []
      console.log(`获取到的字典数据:`, data)
      console.log(`数据长度: ${data.length}`)
      
      // 转换为选项格式 - 使用数字ID而不是dictValue
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
    console.error(`错误详情: ${error.message}`)
    return []
  }
}

// 加载所有需要的字典数据（模仿字典管理页面的逻辑）
const loadAllDictData = async () => {
  try {
    console.log('=== 开始加载字典数据 ===')
    
    // 并行加载所有表单字段对应的字典数据
    const fieldNames = Object.keys(fieldToDictTypeMap)
    console.log('需要加载的字段:', fieldNames)
    console.log('字段映射关系:', fieldToDictTypeMap)
    
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
          case 'genderId':
            genderOptions.value = options
            console.log(`性别选项已更新:`, options)
            console.log(`性别选项数量: ${genderOptions.value.length}`)
            break
          case 'residenceTypeId':
            residenceTypeOptions.value = options
            console.log(`居住类型选项已更新:`, options)
            console.log(`居住类型选项数量: ${residenceTypeOptions.value.length}`)
            break
          case 'incomeSourceId':
            incomeSourceOptions.value = options
            console.log(`收入来源选项已更新:`, options)
            console.log(`收入来源选项数量: ${incomeSourceOptions.value.length}`)
            break
          case 'welfareStatusId':
            welfareStatusOptions.value = options
            console.log(`福利状态选项已更新:`, options)
            console.log(`福利状态选项数量: ${welfareStatusOptions.value.length}`)
            break
          case 'maritalStatusId':
            maritalStatusOptions.value = options
            console.log(`婚姻状况选项已更新:`, options)
            console.log(`婚姻状况选项数量: ${maritalStatusOptions.value.length}`)
            break
          case 'educationLevelId':
            educationOptions.value = options
            console.log(`学历选项已更新:`, options)
            console.log(`学历选项数量: ${educationOptions.value.length}`)
            break
          case 'politicalStatusId':
            politicalStatusOptions.value = options
            console.log(`政治面貌选项已更新:`, options)
            console.log(`政治面貌选项数量: ${politicalStatusOptions.value.length}`)
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
    
    console.log('=== 所有字典数据加载完成 ===')
    console.log('最终选项数据:')
    console.log('- 性别:', genderOptions.value.length, '个选项')
    console.log('- 居住类型:', residenceTypeOptions.value.length, '个选项')
    console.log('- 收入来源:', incomeSourceOptions.value.length, '个选项')
    console.log('- 福利状态:', welfareStatusOptions.value.length, '个选项')
    console.log('- 婚姻状况:', maritalStatusOptions.value.length, '个选项')
    console.log('- 学历:', educationOptions.value.length, '个选项')
    console.log('- 政治面貌:', politicalStatusOptions.value.length, '个选项')
    
  } catch (error) {
    console.error('加载字典数据失败:', error)
    console.error('错误详情:', error.message)
    // 如果字典API失败，使用备用数据
    console.log('使用备用数据确保功能正常')
    loadFallbackData()
  }
}

// 备用数据（当字典API失败时使用）
const loadFallbackData = () => {
  console.log('使用备用数据...')
  genderOptions.value = [
    { id: 29, name: '男' },
    { id: 30, name: '女' }
  ]
  
  residenceTypeOptions.value = [
    { id: 27, name: '常住' },
    { id: 28, name: '流动' }
  ]
  
  incomeSourceOptions.value = [
    { id: 31, name: '种植' },
    { id: 32, name: '养殖' },
    { id: 33, name: '务工' },
    { id: 34, name: '经商' },
    { id: 35, name: '其他' }
  ]
  
  welfareStatusOptions.value = [
    { id: 36, name: '无' },
    { id: 37, name: '低保' },
    { id: 38, name: '低边' },
    { id: 39, name: '五保户' }
  ]
  
  yesNoOptions.value = [
    { id: 0, name: '否' },
    { id: 1, name: '是' }
  ]
  
  maritalStatusOptions.value = [
    { id: 40, name: '未婚' },
    { id: 41, name: '已婚' },
    { id: 42, name: '离异' },
    { id: 43, name: '丧偶' }
  ]
  
  educationOptions.value = [
    { id: 44, name: '文盲' },
    { id: 45, name: '小学' },
    { id: 46, name: '初中' },
    { id: 47, name: '高中' },
    { id: 48, name: '中专' },
    { id: 49, name: '大专' },
    { id: 50, name: '本科' },
    { id: 51, name: '研究生及以上' }
  ]
  
  politicalStatusOptions.value = [
    { id: 71, name: '群众' }
  ]
}

// 枚举选项 - 用于搜索筛选（从字典获取）
const residenceTypeOptions = ref([])

const genderOptions = ref([])
const incomeSourceOptions = ref([])
const welfareStatusOptions = ref([])
// 是否选项 - 固定值 0:否, 1:是
const yesNoOptions = ref([
  { id: 0, name: '否' },
  { id: 1, name: '是' }
])
const maritalStatusOptions = ref([])
const educationOptions = ref([])
const politicalStatusOptions = ref([])


// 表单相关
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

// 批量导入相关
const importDialogVisible = ref(false)
const importLoading = ref(false)

// 导入结果详情对话框
const importResultDialogVisible = ref(false)
const importResultData = ref({})

// 图片预览相关
const previewDialogVisible = ref(false)
const previewImageUrl = ref('')
const previewVillager = ref(null)

// 图片上传相关
const uploadDialogVisible = ref(false)
const uploadRef = ref(null)

const selectedFile = ref(null)
const uploadImageUrl = ref('')
const uploading = ref(false)

// 导出相关
const exportDialogVisible = ref(false)
const exportLoading = ref(false)

// 路径选择相关
const pathDialogVisible = ref(false)
const templatePathDialogVisible = ref(false)
const generateTemplateDialogVisible = ref(false)
const pathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '村民数据'
})
const templatePathForm = reactive({
  directory: '',
  filename: '',
  sheetName: '模板_村民信息'
})
const generateTemplateForm = reactive({
  directory: ''
})
const formData = reactive({
  id: '',
  name: '',
  idCard: '',
  residenceTypeId: null, // 改为ID字段
  age: null,
  genderId: null, // 改为ID字段
  address: '',
  phone: '',
  familySize: null,
  incomeSourceId: null, // 改为ID字段
  welfareStatusId: null, // 改为ID字段
  hasSocialSecurity: 0, // 改为数字类型
  hasMedicalInsurance: 0, // 改为数字类型
  isVeteran: 0, // 改为数字类型
  isVillageCommittee: 0, // 改为数字类型
  // 新增字段
  maritalStatusId: null, // 改为ID字段
  educationLevelId: null, // 改为ID字段
  ethnicity: '',
  politicalStatusId: null, // 改为ID字段
  occupation: '',
  healthStatus: 1, // 改为数字类型，1表示健康
  isPoor: 0, // 改为数字类型
  isDisabled: 0, // 改为数字类型
  isOnlyChildFamily: 0, // 改为数字类型
  isMartyrFamily: 0, // 改为数字类型
  hasOtherSubsidy: 0, // 改为数字类型
  remarks: ''
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 1, max: 50, message: '姓名长度必须在1-50个字符之间', trigger: 'blur' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 0, max: 150, message: '年龄必须大于0且小于150', trigger: 'blur' }
  ],
  genderId: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证号格式不正确', trigger: 'blur' }
  ],
  educationLevelId: [
    { required: true, message: '请选择文化程度', trigger: 'change' }
  ],
  residenceTypeId: [
    { required: true, message: '请选择户籍状态', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入家庭住址', trigger: 'blur' },
    { max: 200, message: '家庭住址长度不能超过200个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系方式', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  familySize: [
    { required: true, message: '请输入家庭人口数', trigger: 'blur' },
    { type: 'number', min: 1, message: '家庭人口数必须大于0', trigger: 'blur' }
  ],
  incomeSourceId: [
    { required: true, message: '请选择主要收入来源', trigger: 'change' }
  ],
  ethnicity: [
    { required: true, message: '请输入民族', trigger: 'blur' }
  ],
  maritalStatusId: [
    { required: true, message: '请选择婚姻状况', trigger: 'change' }
  ],
  occupation: [
    { required: true, message: '请输入职业', trigger: 'blur' }
  ],
  healthStatus: [
    { required: true, message: '请选择健康状况', trigger: 'change' }
  ],
  welfareStatus: [
    { required: true, message: '请选择优抚情况', trigger: 'change' }
  ],
  hasOtherSubsidy: [
    { required: true, message: '请选择是否享受其他补贴', trigger: 'change' }
  ],
  hasSocialSecurity: [
    { required: true, message: '请选择社保缴纳情况', trigger: 'change' }
  ],
  hasMedicalInsurance: [
    { required: true, message: '请选择医保缴纳情况', trigger: 'change' }
  ],
  isPoor: [
    { required: true, message: '请选择是否贫困户', trigger: 'change' }
  ],
  isDisabled: [
    { required: true, message: '请选择是否残疾人', trigger: 'change' }
  ],
  isOnlyChildFamily: [
    { required: true, message: '请选择是否独生子女家庭', trigger: 'change' }
  ],
  isMartyrFamily: [
    { required: true, message: '请选择是否军烈属', trigger: 'change' }
  ],
  isVeteran: [
    { required: true, message: '请选择是否退役军人', trigger: 'change' }
  ],
  remarks: [
    // 备注信息改为非必填
  ]
}


// 加载数据
const loadData = async () => {
  console.log('开始加载村民数据...')
  loading.value = true
  
  try {
    // 构建请求体数据
    const requestData = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    
    // 添加搜索条件，只添加有值的参数
    Object.keys(searchForm).forEach(key => {
      const value = searchForm[key]
      if (value !== null && value !== undefined && value !== '') {
        requestData[key] = value
      }
    })
    
    console.log('请求参数:', requestData)
    
    // 调用API
    const response = await residentAPI.getResidentList(requestData)
    console.log('API响应:', response)
    
    if (response.code === 200) {
      const villagers = response.data.list || []
      
      // 过滤掉name为XXX的用户（用于生成模板的示例数据）
      const filteredVillagers = villagers.filter(villager => villager.name !== 'XXX')
      
      // 先设置数据，让界面先显示
      villagersData.value = filteredVillagers
      total.value = response.data.total || 0
      
      
      // 异步加载图片URL（使用优化的缓存机制）
      // 使用 Promise.allSettled 来避免 forEach 的异步问题
      const imagePromises = filteredVillagers.map(async (villager, index) => {
        if (villager.photoUrl) {
          try {
            const photoUrl = await getPhotoUrl(villager.photoUrl)
            // 使用Vue的响应式更新，直接更新数组中的对象
            villagersData.value[index].photoUrl = photoUrl
          } catch (error) {
            console.error(`加载村民 ${villager.name} 的图片失败:`, error)
            villagersData.value[index].photoUrl = null
          }
        } else {
          villagersData.value[index].photoUrl = null
        }
      })
      
      // 等待所有图片加载完成（不阻塞界面显示）
      Promise.allSettled(imagePromises)
      
      // 启动缓存清理定时器
      startCacheCleanup()
      
      // 预加载下一页的图片（如果存在）
      if (response.data.total > currentPage.value * pageSize.value) {
        // 延迟预加载，避免影响当前页面的显示
        setTimeout(() => {
          preloadImages(filteredVillagers)
        }, 1000)
      }
    } else {
      ElMessage.error(response.message || '获取数据失败')
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 切换搜索展开状态
const toggleSearchExpanded = () => {
  searchExpanded.value = !searchExpanded.value
}

// 切换显示模式
const toggleDisplayMode = () => {
  showFullInfo.value = !showFullInfo.value
}


// 图片缓存管理
const imageCache = new Map()
const CACHE_SIZE_LIMIT = 100 // 最大缓存图片数量
const CACHE_EXPIRE_TIME = 30 * 60 * 1000 // 缓存过期时间：30分钟

// 缓存项结构
class CacheItem {
  constructor(blobUrl, timestamp) {
    this.blobUrl = blobUrl
    this.timestamp = timestamp
  }
  
  isExpired() {
    return Date.now() - this.timestamp > CACHE_EXPIRE_TIME
  }
}

// 清理过期缓存
const cleanExpiredCache = () => {
  const now = Date.now()
  for (const [key, item] of imageCache.entries()) {
    if (item.isExpired()) {
      URL.revokeObjectURL(item.blobUrl)
      imageCache.delete(key)
    }
  }
}

// 清理最旧的缓存项（当缓存达到限制时）
const cleanOldestCache = () => {
  if (imageCache.size >= CACHE_SIZE_LIMIT) {
    const oldestKey = imageCache.keys().next().value
    const oldestItem = imageCache.get(oldestKey)
    URL.revokeObjectURL(oldestItem.blobUrl)
    imageCache.delete(oldestKey)
  }
}

// 获取图片完整URL（带token认证和缓存管理）
const getPhotoUrl = async (photoPath) => {
  if (!photoPath || typeof photoPath !== 'string') {
    return null
  }

  // 如果已经是完整URL，直接返回
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath
  }

  // 检查缓存
  if (imageCache.has(photoPath)) {
    const cacheItem = imageCache.get(photoPath)
    if (!cacheItem.isExpired()) {
      return cacheItem.blobUrl
    } else {
      // 清理过期缓存
      URL.revokeObjectURL(cacheItem.blobUrl)
      imageCache.delete(photoPath)
    }
  }

  try {
    // 清理过期缓存
    cleanExpiredCache()
    
    // 如果缓存达到限制，清理最旧的项
    cleanOldestCache()
    
    // 将反斜杠转换为正斜杠，确保路径格式正确
    const normalizedPath = photoPath.replace(/\\/g, '/')
    
    // 使用axios请求图片，会自动带上Authorization header
    // 后端返回的路径格式：villageresident/photo/filename.jpg
    // 需要添加 /api 前缀进行请求
    const response = await api.get(normalizedPath, {
      responseType: 'blob'
    })
    
    // 由于响应拦截器返回了response.data，所以response就是blob数据
    const blob = new Blob([response])
    const blobUrl = URL.createObjectURL(blob)
    
    // 缓存blob URL和时间戳
    imageCache.set(photoPath, new CacheItem(blobUrl, Date.now()))
    
    return blobUrl
  } catch (error) {
    console.error('加载图片失败:', error)
    return null
  }
}

// 清理所有图片缓存
const clearImageCache = () => {
  for (const [key, item] of imageCache.entries()) {
    URL.revokeObjectURL(item.blobUrl)
  }
  imageCache.clear()
  console.log('图片缓存已清理')
}

// 获取缓存统计信息
const getCacheStats = () => {
  return {
    size: imageCache.size,
    limit: CACHE_SIZE_LIMIT,
    keys: Array.from(imageCache.keys())
  }
}


// 预加载图片（在后台静默加载）
const preloadImages = async (villagers) => {
  const preloadPromises = villagers
    .filter(villager => villager.photoUrl && !villager.photoUrl.startsWith('blob:'))
    .map(async (villager) => {
      try {
        const photoUrl = await getPhotoUrl(villager.photoUrl)
        // 找到对应的村民并更新photoUrl
        const index = villagersData.value.findIndex(v => v.id === villager.id)
        if (index !== -1) {
          villagersData.value[index].photoUrl = photoUrl
        }
      } catch (error) {
        console.error(`预加载图片失败: ${villager.name}`, error)
      }
    })
  
  // 并行预加载，不等待完成
  Promise.allSettled(preloadPromises)
}

// 智能缓存清理（在内存压力大时自动清理）
const smartCacheCleanup = () => {
  // 如果缓存超过限制的80%，清理最旧的20%
  if (imageCache.size > CACHE_SIZE_LIMIT * 0.8) {
    const itemsToRemove = Math.floor(imageCache.size * 0.2)
    const sortedEntries = Array.from(imageCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    for (let i = 0; i < itemsToRemove; i++) {
      const [key, item] = sortedEntries[i]
      URL.revokeObjectURL(item.blobUrl)
      imageCache.delete(key)
    }
    
    console.log(`智能清理：移除了 ${itemsToRemove} 个缓存项`)
  }
}

// 定期清理过期缓存（每5分钟执行一次）
let cacheCleanupInterval = null

const startCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
  }
  
  cacheCleanupInterval = setInterval(() => {
    cleanExpiredCache()
    smartCacheCleanup()
  }, 5 * 60 * 1000) // 5分钟
}

const stopCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval)
    cacheCleanupInterval = null
  }
}

// 调试功能：在控制台暴露缓存管理方法
if (import.meta.env.DEV) {
  window.villagerImageCache = {
    stats: getCacheStats,
    clear: clearImageCache,
    cleanup: cleanExpiredCache,
    smartCleanup: smartCacheCleanup
  }
  console.log('图片缓存调试工具已加载，使用 window.villagerImageCache 访问')
}

// 搜索功能
const handleSearch = () => {
  currentPage.value = 1
  loadData()
}

// 重置搜索条件
const handleReset = () => {
  Object.keys(searchForm).forEach(key => {
    if (typeof searchForm[key] === 'number') {
      searchForm[key] = null
    } else {
      searchForm[key] = ''
    }
  })
  currentPage.value = 1
  loadData()
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  loadData()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  loadData()
}

// 新增村民
const handleAddVillager = () => {
  console.log('点击新增村民按钮')
  isEdit.value = false
  
  // 重置表单并设置默认测试信息
  Object.keys(formData).forEach(key => {
    if (key === 'genderId') {
      formData[key] = null // 不设置默认值，让用户选择
    } else if (key === 'residenceTypeId') {
      formData[key] = null
    } else if (key === 'incomeSourceId') {
      formData[key] = null
    } else if (key === 'welfareStatusId') {
      formData[key] = null
    } else if (key === 'maritalStatusId') {
      formData[key] = null
    } else if (key === 'educationLevelId') {
      formData[key] = null
    } else if (key === 'politicalStatusId') {
      formData[key] = null
    } else if (key === 'healthStatus') {
      formData[key] = 1 // 默认健康
    } else if (key === 'idCard') {
      formData[key] = '540123199001010001' // 西藏身份证号
    } else if (key === 'phone') {
      formData[key] = '17526263451' // 指定的电话号码
    } else if (key === 'name') {
      formData[key] = '测试村民' // 默认姓名
    } else if (key === 'address') {
      formData[key] = '西藏自治区拉萨市城关区测试街道1号' // 默认地址
    } else if (key === 'ethnicity') {
      formData[key] = '藏族' // 默认民族
    } else if (key === 'occupation') {
      formData[key] = '农民' // 默认职业
    } else if (key === 'hasSocialSecurity' || key === 'hasMedicalInsurance' || key === 'isVeteran' || 
               key === 'isVillageCommittee' || key === 'isPoor' || key === 'isDisabled' || 
               key === 'isOnlyChildFamily' || key === 'isMartyrFamily' || key === 'hasOtherSubsidy') {
      formData[key] = 0 // 数字类型的布尔字段默认为0
    } else if (key === 'age' || key === 'familySize') {
      formData[key] = null
    } else {
      formData[key] = ''
    }
  })
  console.log('表单数据重置完成，已设置默认测试信息:', formData)
  dialogVisible.value = true
}


// 查看村民详情
const handleViewDetail = async (villager) => {
  try {
    // 获取完整的村民信息
    const response = await residentAPI.getResidentInfo(villager.id)
    if (response.code === 200) {
      const data = response.data
      // 处理图片URL
      if (data.photoUrl) {
        try {
          const photoUrl = await getPhotoUrl(data.photoUrl)
          data.photoUrl = photoUrl
        } catch (error) {
          console.error('获取图片失败:', error)
          data.photoUrl = null
        }
      }
      selectedVillager.value = data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败，请稍后重试')
  }
}

// 关闭详情对话框
const handleDetailClose = () => {
  detailDialogVisible.value = false
  selectedVillager.value = null
}

// 编辑村民
const handleEdit = async (row) => {
  try {
    console.log('开始编辑，row.id:', row.id, '类型:', typeof row.id)
    
    // 确保字典数据已加载
    if (genderOptions.value.length === 0) {
      console.log('字典数据为空，重新加载...')
      await loadAllDictData()
    }
    
    const response = await residentAPI.getResidentInfo(row.id)
    console.log('获取详情响应:', response)
    
    if (response.code === 200) {
      const data = response.data
      console.log('原始数据:', data)
      
      // 填充表单数据，使用正确的字段名和数据类型
      const formDataValue = {
        id: data.id,
        name: data.name,
        idCard: data.idCard,
        residenceTypeId: data.residenceTypeId,  // 使用ID字段
        age: data.age,
        genderId: data.genderId,  // 使用ID字段
        address: data.address,
        phone: data.phone,
        familySize: data.familySize,
        incomeSourceId: data.incomeSourceId,  // 使用ID字段
        welfareStatusId: data.welfareStatusId,  // 使用ID字段
        hasSocialSecurity: data.hasSocialSecurity,  // 保持数字类型
        hasMedicalInsurance: data.hasMedicalInsurance,  // 保持数字类型
        isVeteran: data.isVeteran,  // 保持数字类型
        // 新增字段
        maritalStatusId: data.maritalStatusId,  // 使用ID字段
        educationLevelId: data.educationLevelId,  // 使用ID字段
        ethnicity: data.ethnicity || '',
        occupation: data.occupation || '',
        healthStatus: data.healthStatus,  // 保持数字类型
        isPoor: data.isPoor,  // 保持数字类型
        isDisabled: data.isDisabled,  // 保持数字类型
        isOnlyChildFamily: data.isOnlyChildFamily,  // 保持数字类型
        isMartyrFamily: data.isMartyrFamily,  // 保持数字类型
        hasOtherSubsidy: data.hasOtherSubsidy,  // 保持数字类型
        remarks: data.remarks || ''
      }
      
      console.log('转换后的表单数据:', formDataValue)
      console.log('编辑数据填充详情:')
      console.log('- 性别ID:', data.genderId, '性别标签:', data.genderLabel)
      console.log('- 居住类型ID:', data.residenceTypeId, '居住类型标签:', data.residenceTypeLabel)
      console.log('- 收入来源ID:', data.incomeSourceId, '收入来源标签:', data.incomeSourceLabel)
      console.log('- 福利状态ID:', data.welfareStatusId, '福利状态标签:', data.welfareStatusLabel)
      console.log('- 婚姻状况ID:', data.maritalStatusId, '婚姻状况标签:', data.maritalStatusLabel)
      console.log('- 学历ID:', data.educationLevelId, '学历标签:', data.educationLevelLabel)
      
      // 逐个更新reactive对象的属性，保持响应式
      Object.assign(formData, formDataValue)
      
      isEdit.value = true
      dialogVisible.value = true
      
      console.log('表单数据设置完成，formData:', formData)
      console.log('枚举字段值检查:')
      console.log('- genderId:', formData.genderId, '类型:', typeof formData.genderId)
      console.log('- residenceTypeId:', formData.residenceTypeId, '类型:', typeof formData.residenceTypeId)
      console.log('- incomeSourceId:', formData.incomeSourceId, '类型:', typeof formData.incomeSourceId)
      console.log('- welfareStatusId:', formData.welfareStatusId, '类型:', typeof formData.welfareStatusId)
      console.log('- maritalStatusId:', formData.maritalStatusId, '类型:', typeof formData.maritalStatusId)
      console.log('- educationLevelId:', formData.educationLevelId, '类型:', typeof formData.educationLevelId)
    } else {
      ElMessage.error(response.message || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败，请稍后重试')
  }
}

// 删除村民
const handleDelete = (row) => {
  ElMessageBox.confirm(
    `确定要删除村民 "${row.name}" 的信息吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      console.log('开始删除，id:', row.id, '类型:', typeof row.id)
      const response = await residentAPI.deleteResident(row.id)
      console.log('删除响应:', response)
      
      if (response.code === 200) {
        ElMessage.success('删除成功')
        loadData()
      } else {
        ElMessage.error(response.message || '删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }).catch(() => {
    // 取消删除
  })
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    // 准备提交数据
    const submitData = { ...formData }
    
    // 新增时移除id字段
    if (!isEdit.value) {
      delete submitData.id
    }
    
    console.log('准备提交的数据:', submitData)
    console.log('枚举字段值:')
    console.log('- 性别ID:', submitData.genderId)
    console.log('- 居住类型ID:', submitData.residenceTypeId)
    console.log('- 收入来源ID:', submitData.incomeSourceId)
    console.log('- 福利状态ID:', submitData.welfareStatusId)
    console.log('- 婚姻状况ID:', submitData.maritalStatusId)
    console.log('- 学历ID:', submitData.educationLevelId)
    console.log('- 政治面貌ID:', submitData.politicalStatusId)
    console.log('- 健康状态:', submitData.healthStatus)
    console.log('- 是否村委:', submitData.isVillageCommittee)
    
    let response
    if (isEdit.value) {
      // 更新
      response = await residentAPI.updateResident(submitData)
    } else {
      // 新增 - 数据格式与API要求匹配
      response = await residentAPI.addResident(submitData)
    }
    
    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  }
}

// 批量导入相关方法
const handleBatchImport = () => {
  importDialogVisible.value = true
}

const handleImportFileChange = (file) => {
  selectedFile.value = file.raw
}


const beforeUpload = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                  file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    ElMessage.error('只能上传 Excel 文件!')
    return false
  }
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB!')
    return false
  }
  return true
}

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要导入的文件')
    return
  }
  
  importLoading.value = true
  try {
    const response = await residentAPI.importResidents(selectedFile.value)
    if (response.code === 200) {
      // 解析导入结果
      importResultData.value = response
      
      // 关闭导入对话框
      importDialogVisible.value = false
      selectedFile.value = null
      uploadRef.value?.clearFiles()
      
      // 显示导入结果详情对话框
      importResultDialogVisible.value = true
      
      // 如果有成功导入的数据，刷新列表
      if (response.success > 0) {
        loadData()
      }
    } else {
      ElMessage.error(response.message || '导入失败，请重试')
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败，请稍后重试')
  } finally {
    importLoading.value = false
  }
}

// 图片预览相关方法
const handleImagePreview = (villager) => {
  previewVillager.value = villager
  previewImageUrl.value = villager.photoUrl || ''
  previewDialogVisible.value = true
}

const handlePreviewClose = () => {
  previewDialogVisible.value = false
  previewVillager.value = null
  previewImageUrl.value = ''
}

const handleUploadAvatar = () => {
  previewDialogVisible.value = false
  uploadDialogVisible.value = true
  // 重置上传状态
  selectedFile.value = null
  uploadImageUrl.value = ''
}

// 图片上传相关方法
const handleFileChange = (file) => {
  selectedFile.value = file.raw
  // 创建预览URL
  const reader = new FileReader()
  reader.onload = (e) => {
    uploadImageUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

const handleUploadClose = () => {
  uploadDialogVisible.value = false
  selectedFile.value = null
  uploadImageUrl.value = ''
  uploadRef.value?.clearFiles()
}

const handleConfirmUpload = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择要上传的图片')
    return
  }

  if (!previewVillager.value?.id) {
    ElMessage.error('无法获取村民信息')
    return
  }

  uploading.value = true
  try {
    // 调用后端上传接口
    const response = await residentAPI.uploadResidentPhoto(previewVillager.value.id, selectedFile.value)
    
    if (response.code === 200) {
      // 上传成功后，调用更新头像路径接口
      const updateResponse = await residentAPI.updateResidentPhoto(previewVillager.value.id, response.data)
      
      if (updateResponse.code === 200) {
        ElMessage.success('头像上传成功')
        
        // 更新当前村民的photoUrl字段
        if (previewVillager.value) {
          previewVillager.value.photoUrl = response.data
          // 更新列表中的对应村民
          const index = villagersData.value.findIndex(v => v.id === previewVillager.value.id)
          if (index !== -1) {
            villagersData.value[index].photoUrl = response.data
            // 重新生成图片URL
            villagersData.value[index].photoUrl = await getPhotoUrl(villagersData.value[index].photoUrl)
          }
        }
        
        uploadDialogVisible.value = false
        selectedFile.value = null
        uploadImageUrl.value = ''
        uploadRef.value?.clearFiles()
      } else {
        ElMessage.error(updateResponse.message || '头像路径更新失败')
      }
    } else {
      ElMessage.error(response.message || '头像上传失败')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请稍后重试')
  } finally {
    uploading.value = false
  }
}


// 导出相关方法
const handleExport = async () => {
  exportDialogVisible.value = true
}

// 导出模板
const handleExportTemplate = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  templatePathForm.filename = `模板_村民信息导入模板_${timestamp}`
  templatePathForm.sheetName = '模板_村民信息'
  templatePathDialogVisible.value = true
}

// 生成说明
const handleGenerateTemplate = () => {
  generateTemplateDialogVisible.value = true
}

const handleSelectPath = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  pathForm.filename = `村民数据导出_${timestamp}`
  pathForm.sheetName = '村民数据'
  pathDialogVisible.value = true
}

// 模板路径选择相关方法
const handleSelectTemplatePath = () => {
  // 生成默认文件名
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '_')
  templatePathForm.filename = `模板_村民信息导入模板_${timestamp}`
  templatePathForm.sheetName = '模板_村民信息'
  templatePathDialogVisible.value = true
}


const handleExportClose = () => {
  exportDialogVisible.value = false
}

const handleSelectDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showPathInputDialog()
}

const handleSelectTemplateDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showTemplatePathInputDialog()
}

const handleSelectGenerateTemplateDirectory = () => {
  // 由于浏览器安全限制，无法直接获取完整路径
  // 我们提供一个更实用的路径选择方案
  showGenerateTemplatePathInputDialog()
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
          ElMessage.success('目录选择成功')
        }
      }
      done()
    }
  }).catch(() => {
    // 用户取消，不需要处理，静默忽略
  })
}

const showTemplatePathInputDialog = () => {
  // 创建自定义的模板路径选择对话框
  ElMessageBox({
    title: '选择模板保存目录',
    message: '由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'path-select-dialog',
    showInput: true,
    inputValue: templatePathForm.directory || 'D:\\',
    inputPlaceholder: '例如：D:\\Documents\\Templates',
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
          templatePathForm.directory = finalPath
          ElMessage.success('目录选择成功')
        }
      }
      done()
    }
  }).catch(() => {
    // 用户取消，不需要处理，静默忽略
  })
}

const showGenerateTemplatePathInputDialog = () => {
  // 创建自定义的生成说明路径选择对话框
  ElMessageBox({
    title: '选择说明文件保存目录',
    message: '由于浏览器安全限制，无法直接获取完整路径，请手动输入保存目录的完整路径',
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    customClass: 'path-select-dialog',
    showInput: true,
    inputValue: generateTemplateForm.directory || 'D:\\',
    inputPlaceholder: '例如：D:\\Documents\\Templates',
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
          generateTemplateForm.directory = finalPath
          ElMessage.success('目录选择成功')
        }
      }
      done()
    }
  }).catch(() => {
    // 用户取消，不需要处理，静默忽略
  })
}


const handleFilenameChange = (value) => {
  // 确保文件名不包含非法字符
  const cleanFilename = value.replace(/[<>:"/\\|?*]/g, '_')
  if (cleanFilename !== value) {
    pathForm.filename = cleanFilename
    ElMessage.warning('文件名包含非法字符，已自动替换为下划线')
  }
}

const handlePathClose = () => {
  pathDialogVisible.value = false
  pathForm.directory = ''
  pathForm.filename = ''
  pathForm.sheetName = '村民数据'
}

// 模板路径选择相关方法
const handleTemplatePathClose = () => {
  templatePathDialogVisible.value = false
  templatePathForm.directory = ''
  templatePathForm.filename = ''
  templatePathForm.sheetName = '模板_村民信息'
}

// 生成说明相关方法
const handleGenerateTemplateClose = () => {
  generateTemplateDialogVisible.value = false
  generateTemplateForm.directory = ''
}

const handleTemplateFilenameChange = (value) => {
  // 确保文件名不包含非法字符
  const cleanFilename = value.replace(/[<>:"/\\|?*]/g, '_')
  if (cleanFilename !== value) {
    templatePathForm.filename = cleanFilename
    ElMessage.warning('文件名包含非法字符，已自动替换为下划线')
  }
}

const handleConfirmTemplateExport = async () => {
  if (!templatePathForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  if (!templatePathForm.filename) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 生成完整路径
    const filename = templatePathForm.filename.endsWith('.xlsx') ? templatePathForm.filename : `${templatePathForm.filename}.xlsx`
    const fullPath = `${templatePathForm.directory}/${filename}`
    
    // 构建请求参数
    const exportRequest = {
      savepath: fullPath,
      sheetName: templatePathForm.sheetName
    }
    
    // 设置查询条件，只包含name: 'XXX'
    const queryRequest = {
      name: 'XXX', // 只使用XXX作为查询条件
      pageNum: 1,
      pageSize: 1 // 设置为1，返回一条示例数据
    }
    
    console.log('模板导出参数:', exportRequest)
    console.log('模板查询条件:', queryRequest)
    
    // 使用普通导出接口而不是模板导出接口
    const response = await residentAPI.exportResidents(exportRequest, queryRequest)
    
    console.log('后端响应:', response)
    
    if (response.code === 200) {
      ElMessage.success(`模板文件已导出到：${fullPath}`)
      templatePathDialogVisible.value = false
    } else {
      ElMessage.error(response.message || '导出模板失败')
    }
  } catch (error) {
    console.error('导出模板失败:', error)
    ElMessage.error('导出模板失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

const handleConfirmGenerateTemplate = async () => {
  if (!generateTemplateForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 生成完整路径，文件名固定为"村民信息导入模板.xlsx"
    const fullPath = `${generateTemplateForm.directory}/村民信息导入模板.xlsx`
    
    // 构建请求参数，只需要保存路径
    const request = {
      savepath: fullPath
    }
    
    console.log('生成说明参数:', request)
    
    // 调用生成说明接口
    const response = await residentAPI.generateTemplate(request)
    
    console.log('后端响应:', response)
    
    // 由于API设置了responseType: 'blob'，成功时返回的是blob数据
    // 如果请求成功，说明文件已经生成
    ElMessage.success(`模板文件已生成到：${fullPath}`)
    generateTemplateDialogVisible.value = false
  } catch (error) {
    console.error('生成模板失败:', error)
    ElMessage.error('生成模板失败，请稍后重试')
  } finally {
    exportLoading.value = false
  }
}

const handleConfirmExport = async () => {
  if (!pathForm.directory) {
    ElMessage.warning('请选择保存目录')
    return
  }
  
  if (!pathForm.filename) {
    ElMessage.warning('请输入文件名')
    return
  }
  
  try {
    exportLoading.value = true
    
    // 生成完整路径
    const filename = pathForm.filename.endsWith('.xlsx') ? pathForm.filename : `${pathForm.filename}.xlsx`
    const fullPath = `${pathForm.directory}/${filename}`
    
    // 准备导出参数
    const exportRequest = {
      savepath: fullPath,
      sheetName: pathForm.sheetName || '村民数据'
    }
    
    // 准备查询条件
    const queryRequest = {
      pageNum: 1,
      pageSize: 999999 // 获取所有数据
    }
    
    // 添加搜索条件，只添加有值的参数
    Object.keys(searchForm).forEach(key => {
      const value = searchForm[key]
      if (value !== null && value !== undefined && value !== '') {
        queryRequest[key] = value
      }
    })
    
    console.log('导出参数:', exportRequest)
    console.log('查询条件:', queryRequest)
    
    // 调用后端导出接口
    const response = await residentAPI.exportResidents(exportRequest, queryRequest)
    
    console.log('后端响应:', response)
    
    if (response.code === 200) {
      ElMessage.success(`Excel文件已导出到：${fullPath}`)
      pathDialogVisible.value = false
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


// 抑制 ResizeObserver 错误
const resizeObserverError = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    e.stopImmediatePropagation()
  }
}

// 测试API调用
const testAPICall = async () => {
  try {
    console.log('=== 测试API调用 ===')
    console.log('测试字典类型API...')
    const typeResponse = await dictAPI.getDictTypeList({ page: 1, size: 10 })
    console.log('字典类型API测试结果:', typeResponse)
    
    if (typeResponse && typeResponse.code === 200 && typeResponse.data.list && typeResponse.data.list.length > 0) {
      const firstType = typeResponse.data.list[0]
      console.log('测试第一个字典类型:', firstType)
      console.log('测试获取字典数据API...')
      const dataResponse = await dictAPI.getDictDataByTypeCode(firstType.typeCode)
      console.log('字典数据API测试结果:', dataResponse)
    }
    console.log('=== API测试完成 ===')
  } catch (error) {
    console.error('API测试失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  console.log('=== 组件挂载，开始初始化 ===')
  window.addEventListener('error', resizeObserverError)
  
  // 先测试API调用
  console.log('1. 开始测试API调用...')
  await testAPICall()
  
  // 先加载字典数据，再加载村民数据
  try {
    console.log('2. 开始加载字典数据...')
    await loadAllDictData()
    console.log('字典数据加载完成')
  } catch (error) {
    console.error('字典数据加载失败，使用备用数据:', error)
    loadFallbackData()
  }
  
  console.log('3. 开始加载村民数据...')
  await loadData()
  
  console.log('=== 组件初始化完成 ===')
  console.log('村民数据加载完成')
})

// 组件卸载时清理资源
onUnmounted(() => {
  window.removeEventListener('error', resizeObserverError)
  stopCacheCleanup()
  clearImageCache()
})
</script>

<style scoped>
.villagers-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

/* 搜索头部样式 */
.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.search-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.search-title .el-icon {
  color: #409eff;
  font-size: 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn {
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  color: #409eff;
  background: #f5f7fa;
}

.display-toggle-btn {
  color: #606266;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.display-toggle-btn:hover {
  color: #409eff;
  background: #f5f7fa;
  border-color: #409eff;
}

.display-toggle-btn.active {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
}

/* 快速搜索样式 */
.quick-search {
  margin-bottom: 16px;
}

.quick-search-form {
  margin: 0;
}

.search-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 600px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-btn,
.reset-btn {
  flex-shrink: 0;
}

/* 详细搜索样式 */
.detailed-search {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.filter-form {
  margin-bottom: 0;
}

.filter-form .el-form-item {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
}

.form-row .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-right {
  display: flex;
  align-items: center;
}

.total-info {
  color: #606266;
  font-size: 14px;
}

/* 村民卡片列表样式 */
.villagers-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.villager-card {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  margin-bottom: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.villager-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* 照片区域 */
.photo-section {
  margin-right: 20px;
  flex-shrink: 0;
}

.villager-photo {
  width: 80px;
  height: 80px; /* 1:1 比例 */
  border-radius: 8px;
  overflow: hidden !important;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  border: none !important;
  outline: none !important;
  clip-path: inset(0 round 8px);
}

.villager-photo:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.photo-image {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 0 !important;
  display: block !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.photo-placeholder {
  font-size: 24px;
  color: #999;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 8px;
}

.villager-photo:hover .photo-overlay {
  opacity: 1;
}

.preview-icon {
  color: white;
  font-size: 24px;
}

/* 信息区域 */
.info-section {
  flex: 1;
  min-width: 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.info-row:last-child {
  margin-bottom: 0;
}

/* 基本信息行 */
.info-row.primary {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.name-group {
  flex: 1;
  min-width: 0;
}

.villager-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.basic-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.gender-age {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.residence-tag {
  font-size: 12px;
}

.contact-info {
  text-align: right;
  flex-shrink: 0;
  margin-left: 16px;
}

.phone {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.id-card {
  font-size: 12px;
  color: #909399;
  font-family: 'Courier New', monospace;
}

/* 地址和家庭信息行 */
.info-row.secondary {
  align-items: flex-start;
}

.address-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
  margin-right: 16px;
}

.info-icon {
  color: #909399;
  margin-right: 6px;
  margin-top: 2px;
  flex-shrink: 0;
}

.address {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
  word-break: break-all;
}

.family-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  flex-shrink: 0;
}

.family-size {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.income-source {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

/* 状态标签行 */
.info-row.status-row {
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

/* 身份标签行 */
.info-row.identity-row {
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.status-tags,
.identity-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* 详细信息行 */
.info-row.details {
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.detail-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}

.detail-label {
  color: #909399;
  margin-right: 4px;
  font-weight: 500;
}

.detail-value {
  color: #303133;
  font-weight: 400;
}

/* 项目信息行 */
.info-row.project {
  align-items: flex-start;
}

.project-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.project-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.project-position {
  color: #909399;
  font-size: 13px;
}

/* 备注信息行 */
.info-row.remarks {
  align-items: flex-start;
  background: #f8f9fa;
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #e4e7ed;
}

.remarks-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.remarks-label {
  color: #909399;
  font-size: 13px;
  font-weight: 500;
  margin-right: 6px;
  flex-shrink: 0;
}

.remarks-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.4;
  word-break: break-all;
}

/* 操作按钮区域 */
.action-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
  flex-shrink: 0;
}

.action-btn {
  padding: 8px 12px;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f5f7fa;
}

/* 空状态 */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
}

.form-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.form-row .el-form-item {
  flex: 1;
  min-width: 200px;
}

/* 图片预览对话框样式 */
.preview-dialog .el-dialog__body {
  padding: 30px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.preview-image-wrapper {
  width: 100%;
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  object-fit: contain;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f5f5f5;
  border-radius: 8px;
  color: #999;
}

.preview-placeholder-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.preview-info {
  width: 100%;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
}

.preview-info h4 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 18px;
}

.preview-info p {
  margin: 6px 0;
  color: #666;
  font-size: 14px;
}

.preview-actions {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  width: 100%;
}

/* 图片上传对话框样式 */
.upload-dialog .el-dialog__body {
  padding: 40px 20px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: 500px !important;
  text-align: center !important;
}

.upload-container {
  display: flex !important;
  flex-direction: column !important;
  gap: 24px !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  max-width: 320px !important;
  margin: 0 auto !important;
  text-align: center !important;
}

.avatar-uploader {
  width: 100%;
}

.upload-area {
  width: 100% !important;
  height: 200px !important;
  border: 2px dashed #d9d9d9 !important;
  border-radius: 8px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
  transition: border-color 0.3s ease !important;
  position: relative !important;
  overflow: hidden !important;
  margin: 0 auto !important;
  text-align: center !important;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  text-align: center;
  width: 100%;
  height: 100%;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.upload-text p {
  margin: 4px 0;
  font-size: 14px;
}

.upload-tip {
  font-size: 12px !important;
  color: #ccc !important;
}

.upload-actions {
  display: flex !important;
  gap: 12px !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  margin-top: 20px !important;
}

/* 新增/编辑对话框样式 */
.form-dialog .el-dialog {
  max-height: 90vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: calc(50% + 120px) !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2000 !important;
}

.form-dialog .el-dialog__body {
  max-height: 70vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 20px !important;
  position: relative !important;
  /* 强制启用滚动 */
  -webkit-overflow-scrolling: touch !important;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

/* 强制覆盖Element Plus默认样式 */
.form-dialog .el-dialog__body::-webkit-scrollbar {
  width: 8px !important;
  display: block !important;
}

.form-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: #f0f2f5 !important;
  border-radius: 4px !important;
}

.form-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: #409eff !important;
  border-radius: 4px !important;
}

/* 对话框滚动容器 */
.dialog-scroll-container {
  max-height: 70vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 0 !important;
  /* 强制启用滚动 */
  -webkit-overflow-scrolling: touch !important;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

.dialog-scroll-container::-webkit-scrollbar {
  width: 8px !important;
  display: block !important;
}

.dialog-scroll-container::-webkit-scrollbar-track {
  background: #f0f2f5 !important;
  border-radius: 4px !important;
}

.dialog-scroll-container::-webkit-scrollbar-thumb {
  background: #409eff !important;
  border-radius: 4px !important;
}

.dialog-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #337ecc !important;
}


/* 详情对话框滚动容器 */
.detail-scroll-container {
  max-height: 75vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 0 !important;
  /* 强制启用滚动 */
  -webkit-overflow-scrolling: touch !important;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

.detail-scroll-container::-webkit-scrollbar {
  width: 8px !important;
  display: block !important;
}

.detail-scroll-container::-webkit-scrollbar-track {
  background: #f0f2f5 !important;
  border-radius: 4px !important;
}

.detail-scroll-container::-webkit-scrollbar-thumb {
  background: #409eff !important;
  border-radius: 4px !important;
}

.detail-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #337ecc !important;
}

/* 村民详情对话框样式 */
.detail-dialog .el-dialog {
  max-height: 90vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: calc(50% + 120px) !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2000 !important;
}

.detail-dialog .el-dialog__body {
  max-height: 75vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 20px !important;
  position: relative !important;
  /* 强制启用滚动 */
  -webkit-overflow-scrolling: touch !important;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

.detail-dialog .el-dialog__body::-webkit-scrollbar {
  width: 10px;
}

.detail-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: #f0f2f5;
  border-radius: 5px;
  margin: 5px 0;
}

.detail-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 5px;
  border: 1px solid #e4e7ed;
}

.detail-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: #337ecc;
  border-color: #c6e2ff;
}

/* 滚动提示 - 简化版本 */
.detail-dialog .el-dialog__body::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.8));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.detail-dialog .el-dialog__body:hover::after {
  opacity: 1;
}

.detail-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  width: 100%;
}

.detail-photo-section {
  flex-shrink: 0;
}

.detail-photo {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e4e7ed;
  transition: border-color 0.3s ease;
}

.detail-photo:hover {
  border-color: #409eff;
}

.detail-photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-photo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #909399;
  font-size: 48px;
}

.detail-info-section {
  flex: 1;
  min-width: 0;
}

.detail-title {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  text-align: center;
  padding-bottom: 15px;
  border-bottom: 2px solid #e4e7ed;
}

.detail-form-container {
  width: 100%;
}

.detail-form {
  background: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.detail-form-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.3s ease;
}

.detail-form-row:last-child {
  border-bottom: none;
}

.detail-form-row:hover {
  background-color: #f8f9fa;
}

.detail-form-row:nth-child(even) {
  background-color: #fafbfc;
}

.detail-form-row:nth-child(even):hover {
  background-color: #f0f9ff;
}

.detail-form-label {
  font-weight: 600;
  color: #606266;
  background: #f5f7fa;
  padding: 16px 20px;
  font-size: 14px;
  text-align: right;
  white-space: nowrap;
  width: 140px;
  min-width: 140px;
  border-right: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.detail-form-value {
  color: #303133;
  font-size: 14px;
  padding: 16px 20px;
  flex: 1;
  word-break: break-all;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row {
  display: contents;
}

.detail-label {
  font-weight: 600;
  color: #606266;
  padding: 8px 12px;
  background: #f0f2f5;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.detail-value {
  padding: 8px 12px;
  color: #303133;
  background: #ffffff;
  border-radius: 4px;
  font-size: 14px;
  display: flex;
  align-items: center;
  word-break: break-all;
}

.detail-value .el-tag {
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-container {
    flex-direction: column;
    gap: 20px;
  }
  
  .preview-image-wrapper {
    max-width: 100%;
  }

  .detail-container {
    flex-direction: column;
    gap: 20px;
    align-items: center;
  }

  .detail-photo {
    width: 100px;
    height: 100px;
  }

  .detail-table {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .detail-label {
    font-size: 13px;
    padding: 6px 10px;
  }

  .detail-value {
    font-size: 13px;
    padding: 6px 10px;
  }

  .form-dialog .el-dialog {
    max-height: 95vh !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  .form-dialog .el-dialog__body {
    padding: 15px !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
  }

  .detail-dialog .el-dialog {
    max-height: 95vh !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
  }

  .detail-dialog .el-dialog__body {
    padding: 15px !important;
    max-height: 80vh !important;
    overflow-y: auto !important;
  }

  .detail-container {
    flex-direction: column;
    gap: 15px;
    align-items: center;
  }

  .detail-photo {
    width: 80px;
    height: 80px;
  }

  .detail-form-label {
    width: 100px;
    min-width: 100px;
    padding: 12px 15px;
    font-size: 12px;
  }
  
  .detail-form-value {
    padding: 12px 15px;
    font-size: 12px;
  }
}

/* 优化后的筛选布局样式 */
.search-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 600px;
}

.search-input {
  flex: 1;
  max-width: 400px;
}

.search-btn, .reset-btn {
  height: 40px;
  padding: 0 20px;
  font-weight: 500;
}

/* 筛选分组样式 */
.filter-section {
  margin-bottom: 24px;
  background: #fafbfc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e4e7ed;
}

.section-title .el-icon {
  margin-right: 8px;
  color: #409eff;
  font-size: 18px;
}

/* 表单网格布局 */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.form-grid .el-form-item {
  margin-bottom: 0;
}

/* 表单控件样式 */
.form-input {
  width: 100%;
}

.form-input-wide {
  width: 100%;
  grid-column: span 2;
}

.form-select {
  width: 100%;
}

.age-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.age-input {
  flex: 1;
  min-width: 80px;
}

.range-separator {
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
}

/* 操作按钮样式 */
.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
}

.form-actions .el-button {
  min-width: 120px;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .search-input-group {
    flex-direction: column;
    align-items: stretch;
    max-width: 100%;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-input-wide {
    grid-column: span 1;
  }
  
  .filter-section {
    padding: 15px;
  }
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .form-actions .el-button {
    width: 100%;
    max-width: 200px;
  }
}

/* 导出对话框样式 */
.export-dialog .el-dialog {
  max-height: 95vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: calc(50% + 120px) !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2000 !important;
}

.export-dialog .el-dialog__body {
  max-height: 85vh !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 32px !important;
  position: relative !important;
  /* 强制启用滚动 */
  -webkit-overflow-scrolling: touch !important;
  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: #409eff #f0f2f5;
}

.export-dialog .el-dialog__body::-webkit-scrollbar {
  width: 8px !important;
  display: block !important;
}

.export-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: #f0f2f5 !important;
  border-radius: 4px !important;
}

.export-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: #409eff !important;
  border-radius: 4px !important;
}

.export-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: #337ecc !important;
}

.export-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
}

.export-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.export-icon {
  font-size: 48px;
  color: #409eff;
  background: #f0f9ff;
  padding: 16px;
  border-radius: 50%;
  border: 2px solid #e1f5fe;
}

.export-text h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.export-text p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.export-actions {
  display: flex;
  justify-content: center;
}

.export-actions .el-button {
  height: 44px;
  padding: 0 32px;
  border-radius: 8px;
  font-weight: 500;
  font-size: 16px;
  transition: all 0.3s ease;
}




.export-table-container {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.export-table-container .el-table {
  border-radius: 12px;
  overflow: hidden;
}

.export-table-container .el-table th {
  background: #f8f9fa !important;
  color: #495057 !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  padding: 12px 8px !important;
  border-bottom: 2px solid #dee2e6 !important;
}

.export-table-container .el-table td {
  padding: 10px 8px !important;
  font-size: 12px !important;
  border-bottom: 1px solid #f1f3f4 !important;
}

.export-table-container .el-table--striped .el-table__body tr.el-table__row--striped td {
  background: #f8f9fa !important;
}

.export-table-container .el-table__body tr:hover > td {
  background: #e3f2fd !important;
}

.export-table-container .el-table .el-tag {
  font-size: 11px !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .export-dialog .el-dialog {
    max-height: 95vh !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 95% !important;
  }

  .export-dialog .el-dialog__body {
    padding: 15px !important;
    max-height: 80vh !important;
  }

  .export-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 16px;
  }

  .export-info {
    flex-direction: column;
    gap: 12px;
  }

  .export-actions {
    flex-direction: column;
    width: 100%;
  }

  .export-actions .el-button {
    width: 100%;
    max-width: 200px;
  }

  .export-table-container {
    overflow-x: auto;
  }

  .export-table-container .el-table {
    min-width: 800px;
  }
}

/* 路径选择对话框样式 */
.path-dialog .el-dialog {
  max-height: 80vh !important;
  margin: 0 !important;
  border-radius: 8px !important;
  position: fixed !important;
  top: 50% !important;
  left: calc(50% + 120px) !important;
  transform: translate(-50%, -50%) !important;
  z-index: 2000 !important;
}

.path-dialog .el-dialog__body {
  max-height: 60vh !important;
  overflow-y: auto !important;
  padding: 20px !important;
  position: relative !important;
}

.path-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.path-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.path-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.path-input {
  flex: 1;
}

.filename-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border-radius: 4px;
  font-size: 13px;
  color: #1976d2;
  border-left: 3px solid #2196f3;
  word-break: break-all;
}

.path-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.path-actions .el-button {
  min-width: 100px;
  height: 36px;
}

.path-tips {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 12px;
  color: #409eff;
  border-left: 3px solid #409eff;
}

.path-tips .el-icon {
  font-size: 14px;
}



/* 路径选择对话框样式 */
.path-select-dialog .el-message-box {
  width: 500px !important;
  border-radius: 12px !important;
}

.path-select-dialog .el-message-box__header {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  color: white;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

.path-select-dialog .el-message-box__title {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.path-select-dialog .el-message-box__headerbtn .el-message-box__close {
  color: white;
  font-size: 20px;
}

.path-select-dialog .el-message-box__content {
  padding: 24px;
  background: #f8f9fa;
}

.path-select-dialog .el-message-box__message {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.path-select-dialog .el-textarea__inner {
  border-radius: 8px;
  border: 2px solid #e4e7ed;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  padding: 12px;
  transition: all 0.3s ease;
}

.path-select-dialog .el-textarea__inner:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.path-select-dialog .el-message-box__btns {
  padding: 16px 24px 24px;
  background: white;
  border-radius: 0 0 12px 12px;
}

.path-select-dialog .el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 24px;
}

.path-select-dialog .el-button--primary {
  background: #409eff;
  border-color: #409eff;
}

.path-select-dialog .el-button--primary:hover {
  background: #66b3ff;
  border-color: #66b3ff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .villagers-container {
    padding: 16px;
  }

  .path-dialog .el-dialog {
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 95% !important;
  }

  .path-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .path-actions {
    flex-direction: column;
  }

  .path-actions .el-button {
    width: 100%;
  }
}
</style>
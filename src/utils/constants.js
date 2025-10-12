// 村内人员相关枚举常量

// 户籍状态枚举
export const RESIDENCE_TYPE = {
  PERMANENT: { value: 'PERMANENT', label: '常住' },
  FLOATING: { value: 'FLOATING', label: '流动' }
}

// 性别枚举
export const GENDER = {
  MALE: { value: 'MALE', label: '男' },
  FEMALE: { value: 'FEMALE', label: '女' }
}

// 收入来源枚举
export const INCOME_SOURCE = {
  PLANTING: { value: 'PLANTING', label: '种植' },
  BREEDING: { value: 'BREEDING', label: '养殖' },
  WORKING: { value: 'WORKING', label: '务工' },
  BUSINESS: { value: 'BUSINESS', label: '经商' },
  OTHER: { value: 'OTHER', label: '其他' }
}

// 优抚情况枚举
export const WELFARE_STATUS = {
  NONE: { value: 'NONE', label: '无' },
  LOW_INCOME: { value: 'LOW_INCOME', label: '低保' },
  LOW_BORDER: { value: 'LOW_BORDER', label: '低边' },
  FIVE_GUARANTEES: { value: 'FIVE_GUARANTEES', label: '五保户' }
}

// 是否状态枚举
export const YES_NO_STATUS = {
  NO: { value: 0, label: '否' },
  YES: { value: 1, label: '是' }
}

// 政治面貌枚举
export const POLITICAL_STATUS = {
  PARTY_MEMBER: { value: 'PARTY_MEMBER', label: '党员' },
  YOUTH_LEAGUE_MEMBER: { value: 'YOUTH_LEAGUE_MEMBER', label: '共青团员' },
  PROBATIONARY_MEMBER: { value: 'PROBATIONARY_MEMBER', label: '预备党员' },
  ACTIVIST: { value: 'ACTIVIST', label: '入党积极分子' },
  MASSES: { value: 'MASSES', label: '群众' }
}

// 文化程度枚举
export const EDUCATION = {
  ILLITERATE: { value: 'ILLITERATE', label: '文盲' },
  PRIMARY: { value: 'PRIMARY', label: '小学' },
  JUNIOR: { value: 'JUNIOR', label: '初中' },
  SENIOR: { value: 'SENIOR', label: '高中' },
  SECONDARY: { value: 'SECONDARY', label: '中专' },
  COLLEGE: { value: 'COLLEGE', label: '大专' },
  BACHELOR: { value: 'BACHELOR', label: '本科' },
  MASTER: { value: 'MASTER', label: '研究生及以上' }
}

// 婚姻状况枚举
export const MARITAL_STATUS = {
  UNMARRIED: { value: 'UNMARRIED', label: '未婚' },
  MARRIED: { value: 'MARRIED', label: '已婚' },
  DIVORCED: { value: 'DIVORCED', label: '离异' },
  WIDOWED: { value: 'WIDOWED', label: '丧偶' }
}

// 村委会职务枚举
export const COMMITTEE_DUTY = {
  VILLAGE_SECRETARY: { value: 'VILLAGE_SECRETARY', label: '村支书' },
  VILLAGE_CHIEF: { value: 'VILLAGE_CHIEF', label: '村长' },
  ACCOUNTANT: { value: 'ACCOUNTANT', label: '会计' },
  MEMBER: { value: 'MEMBER', label: '委员' }
}

// 获取枚举选项数组
export const getResidenceTypeOptions = () => Object.values(RESIDENCE_TYPE)
export const getGenderOptions = () => Object.values(GENDER)
export const getIncomeSourceOptions = () => Object.values(INCOME_SOURCE)
export const getWelfareStatusOptions = () => Object.values(WELFARE_STATUS)
export const getYesNoOptions = () => Object.values(YES_NO_STATUS)
export const getPoliticalStatusOptions = () => Object.values(POLITICAL_STATUS)
export const getEducationOptions = () => Object.values(EDUCATION)
export const getMaritalStatusOptions = () => Object.values(MARITAL_STATUS)
export const getCommitteeDutyOptions = () => Object.values(COMMITTEE_DUTY)

// 根据值获取标签
export const getResidenceTypeLabel = (value) => {
  const option = Object.values(RESIDENCE_TYPE).find(item => item.value === value)
  return option ? option.label : value
}

export const getGenderLabel = (value) => {
  const option = Object.values(GENDER).find(item => item.value === value)
  return option ? option.label : value
}

export const getIncomeSourceLabel = (value) => {
  const option = Object.values(INCOME_SOURCE).find(item => item.value === value)
  return option ? option.label : value
}

export const getWelfareStatusLabel = (value) => {
  const option = Object.values(WELFARE_STATUS).find(item => item.value === value)
  return option ? option.label : value
}

export const getYesNoLabel = (value) => {
  const option = Object.values(YES_NO_STATUS).find(item => item.value === value)
  return option ? option.label : value
}

export const getPoliticalStatusLabel = (value) => {
  if (!value) return '未填写'
  const option = Object.values(POLITICAL_STATUS).find(item => item.value === value)
  return option ? option.label : value
}

export const getEducationLabel = (value) => {
  if (!value) return '未填写'
  const option = Object.values(EDUCATION).find(item => item.value === value)
  return option ? option.label : value
}

export const getMaritalStatusLabel = (value) => {
  if (!value) return '未填写'
  const option = Object.values(MARITAL_STATUS).find(item => item.value === value)
  return option ? option.label : value
}

export const getCommitteeDutyLabel = (value) => {
  if (!value) return '未设置'
  const option = Object.values(COMMITTEE_DUTY).find(item => item.value === value)
  return option ? option.label : value
}

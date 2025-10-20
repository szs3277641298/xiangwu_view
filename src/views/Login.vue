<template>
  <div class="login-container">
    <!-- 动态背景 -->
    <DynamicBackground />

    <!-- 登录表单 - 居中布局 -->
    <div class="login-wrapper fade-in" :class="{ 'form-fade-in': formFadeIn }">
      <div class="login-form-container">
        <!-- 系统标题 -->
        <div class="system-title">
          <h1>村级信息管理系统</h1>
          <p class="system-subtitle">村级综合管理平台</p>
        </div>
        
        <div class="login-header">
          <p>请输入您的账号信息登录系统</p>
        </div>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="off">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
              :validate-event="false"
              autocomplete="off"
            ></el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              :validate-event="false"
              show-password
              autocomplete="new-password"
            ></el-input>
          </el-form-item>

          <el-form-item prop="captcha">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                prefix-icon="el-icon-picture-outline"
                :validate-event="false"
              ></el-input>
              <div class="captcha-image" @click="getCaptcha">
                <img :src="captchaImage" alt="验证码" v-if="captchaImage" />
                <span v-else>点击获取验证码</span>
              </div>
            </div>
          </el-form-item>

          <div class="login-form-actions">
            <el-checkbox v-model="loginForm.rememberMe">记住我</el-checkbox>
            <el-button type="text" @click="showForgotPassword = true">忘记密码？</el-button>
          </div>

          <el-form-item>
            <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
              {{ loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>

          <div class="register-link">
            <span>还没有账号？</span>
            <el-button type="text" @click="toRegister" class="register-button-link">立即注册</el-button>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/api'
import { showErrorMessage } from '@/utils/errorHandler'
import { useUserStore } from '@/store/index.js'
import DynamicBackground from '@/components/DynamicBackground.vue'

export default {
  name: 'Login',
  data() {
    return {
      loading: false,
      resetLoading: false,
      loginForm: {
        username: '',
        password: '',
        captcha: '',
        rememberMe: false
      },
      forgotPasswordForm: {
        username: '',
        mobile: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
      },
      captchaImage: '',
      captchaKey: '',
      showForgotPassword: false,
      sendDisabled: false,
      countdown: 60,
      timer: null,
      brandFadeIn: false,
      formFadeIn: false,
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          {trigger: 'blur' }
        ]
      },
    }
  },
  created() {
    // 页面加载后执行动画
    setTimeout(() => {
      this.brandFadeIn = true
    }, 100)
    setTimeout(() => {
      this.formFadeIn = true
    }, 300)
    
    // 自动获取验证码
    this.getCaptcha()
    
    // 检查是否有记住的账号信息
    this.loadRememberedAccount()
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
    // 清理验证码图片URL
    if (this.captchaImage && this.captchaImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.captchaImage)
    }
  },
  methods: {
    // 加载记住的账号信息
    loadRememberedAccount() {
      const savedUsername = localStorage.getItem('rememberedUsername')
      const savedPassword = localStorage.getItem('rememberedPassword')
      if (savedUsername && savedPassword) {
        this.loginForm.username = savedUsername
        this.loginForm.password = savedPassword
        this.loginForm.rememberMe = true
      }
    },
    
    // 获取验证码
    async getCaptcha() {
      try {
        // 先清理之前的图片URL，避免内存泄漏
        if (this.captchaImage && this.captchaImage.startsWith('blob:')) {
          URL.revokeObjectURL(this.captchaImage)
        }
        
        // 显示加载状态
        this.captchaImage = ''
        
        const response = await authAPI.getCaptcha()
        
        // 打印原始响应对象
        console.log('原始响应:', response)
        
        // 检查响应是否成功 - 使用status检查HTTP状态码
        if (response && response.status === 200) {
          console.log('响应状态码:', response.status)
          
          // 从response.data中获取验证码数据
          this.captchaKey = response.data.captchaKey || ''
          this.captchaImage = response.data.captchaImage || ''
          
      
          if (!this.captchaKey || !this.captchaImage) {
            console.warn('验证码数据不完整')
            this.$message.warning('获取验证码不完整，请重试')
          }
        } else {
          console.error('获取验证码响应失败:', response)
          showErrorMessage({response}, this, '获取验证码失败，请重试')
        }
      } catch (error) {
        console.error('获取验证码请求异常:', error)
        // 打印详细错误信息
        if (error.request) {
          console.error('无响应:', error.request)
        } else {
          console.error('请求配置错误:', error.message)
        }
        showErrorMessage(error, this)
      }
    },
    
    
    // 处理登录
    async handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const { username, password, captcha, rememberMe } = this.loginForm
            
            // 打印登录请求前的所有参数
            console.log('登录表单数据:', {
              username,
              password: '******', // 密码脱敏
              captcha,
              rememberMe,
              captchaKey: this.captchaKey
            })
            
            // 特别打印captchaKey状态
            console.log('当前captchaKey是否存在:', !!this.captchaKey)
            console.log('captchaKey长度:', this.captchaKey ? this.captchaKey.length : 0)
            
            // 构建登录请求数据，确保captchaKey在请求体中
            const loginData = {
              username,
              password,
              captchaInput: captcha,  // 用于后端验证的验证码输入
              captchaKey: this.captchaKey  // 从响应头获取的验证码密钥
            }
            
            console.log('构建的登录请求数据完整结构:', loginData)
            
            const response = await authAPI.login(loginData)
            
            // 登录响应调试日志
            console.log('登录请求响应:', response)
            
            if (response.code === 200) {
              // 根据实际响应结构创建userInfo对象
              // 从response.data中直接获取username、role和roleId
              const userInfo = {
                username: response.data.username || username,
                role: response.data.role || 'user',
                roleId: response.data.roleId || 1, // 添加roleId字段
              }
              
              console.log('创建的用户信息对象:', userInfo)
              
              // 使用store的方法来设置token和用户信息，确保状态同步
              const userStore = useUserStore()
              userStore.setToken(response.data.token)
              userStore.setUserInfo(userInfo)
              
              console.log('登录成功，已存储用户信息:', userInfo)
              
              // 验证localStorage中的数据
              const storedUserInfo = localStorage.getItem('userInfo')
              console.log('验证localStorage中的用户信息:', storedUserInfo)
              
              // 验证用户store中的数据
              console.log('验证用户store中的用户信息:', userStore.userInfo)
              console.log('验证用户store中的roleId:', userStore.getUserRoleId)
              
              
              // 记住账号
              if (rememberMe) {
                localStorage.setItem('rememberedUsername', username)
                localStorage.setItem('rememberedPassword', password)
              } else {
                localStorage.removeItem('rememberedUsername')
                localStorage.removeItem('rememberedPassword')
              }
              
              // 登录成功后跳转到首页
              this.$router.push('/')
            } else {
              showErrorMessage({response}, this, '登录失败')
              this.getCaptcha()
            }
          } catch (error) {
            showErrorMessage(error, this)
            this.getCaptcha()
          } finally {
            this.loading = false
          }
        }
      })
    },
    
    // 处理密码重置
    async handleResetPassword() {
      this.$refs.forgotPasswordForm.validate(async (valid) => {
        if (valid) {
          this.resetLoading = true
          try {
            const { username, mobile, verificationCode, newPassword } = this.forgotPasswordForm
            const response = await authAPI.resetPassword({
              username,
              mobile,
              verificationCode,
              newPassword
            })
            
            if (response.code === 200) {
              this.$message.success('密码重置成功，请登录')
              this.showForgotPassword = false
              // 跳转到登录页面
              this.$router.push('/login')
            } else {
              showErrorMessage({response}, this, '密码重置失败')
            }
          } catch (error) {
            showErrorMessage(error, this)
            console.error('密码重置失败:', error)
          } finally {
            this.resetLoading = false
          }
        }
      })
    },
    
    // 处理对话框关闭
    handleDialogClose() {
      // 清除倒计时
      if (this.timer) {
        clearInterval(this.timer)
        this.sendDisabled = false
        this.countdown = 60
      }
      this.showForgotPassword = false
    },
    
    // 跳转到注册页面
    toRegister() {
      this.$router.push('/register')
    }
  }
}
</script>

<style scoped>
/* 登录容器 - 全屏样式 */
.login-container {
  position: relative;
  display: flex;
  min-height: 100vh;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* 背景装饰 */


/* 登录包装器 - 居中布局 */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  min-height: 800px;
  margin: 0;
  padding: 0;
  z-index: 1;
}

/* 登录表单容器 - 居中毛玻璃效果 */
.login-form-container {
  width: 100%;
  max-width: 450px;
  padding: 60px 50px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  position: relative;
}


/* 系统标题样式 */
.system-title {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
}

.system-title h1 {
  font-size: 28px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 8px 0;
  letter-spacing: 1px;
}

.system-subtitle {
  font-size: 16px;
  color: #7f8c8d;
  margin: 0;
  font-weight: 400;
}

.login-header {
  margin-bottom: 40px;
  text-align: center;
}

.login-header h2 {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.login-header p {
  font-size: 16px;
  color: #606266;
}

.login-form {
  width: 100%;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

/* 验证码容器样式 */
.captcha-container {
  display: flex;
  gap: 16px;
  align-items: center;
}

.captcha-container .el-input {
  flex: 1;
}

.captcha-image {
  width: 120px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  background: #f5f7fa;
  color: #606266;
  font-size: 14px;
  transition: all 0.3s;
  overflow: hidden;
}

.captcha-image:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 登录表单操作区域 */
.login-form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}

.register-button {
  font-size: 14px;
  color: #409eff;
  padding: 0;
}

.register-button:hover {
  color: #66b1ff;
}

/* 忘记密码对话框样式 */
.forgot-password-form {
  margin-top: 20px;
}

.forgot-password-form .el-form-item {
  margin-bottom: 16px;
}

/* 验证码容器样式 */
.verification-code-container {
  display: flex;
  gap: 16px;
  align-items: center;
}

.verification-code-container .el-input {
  flex: 1;
}

.send-code-button {
  width: 120px;
  white-space: nowrap;
}

/* 淡入动画 */
.fade-in {
  opacity: 1;
}

/* 响应式调整 - 针对不同屏幕尺寸优化 */
@media (max-width: 768px) {
  .login-form-container {
    max-width: 400px;
    padding: 50px 40px;
    margin: 20px;
  }

  .login-header h2 {
    font-size: 28px;
  }

  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }

  .captcha-image {
    width: 100%;
    margin-top: 10px;
  }
}

@media (max-width: 576px) {
  .login-form-container {
    padding: 40px 30px;
    margin: 15px;
  }

  .login-header h2 {
    font-size: 24px;
  }

  .login-form .el-form-item {
    margin-bottom: 16px;
  }
}

@media (max-width: 480px) {
  .login-form-container {
    padding: 30px 20px;
    margin: 10px;
  }

  .login-header h2 {
    font-size: 22px;
  }
}
</style>
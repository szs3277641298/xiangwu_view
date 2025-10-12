<template>
  <div class="register-container">
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="register-wrapper">
      <div class="register-left"></div>
      
      <div class="register-right fade-in" :class="{ 'form-fade-in': formFadeIn }">
        <div class="register-form-container">
          <div class="register-header">
            <h2>创建账号</h2>
            <p>填写以下信息完成注册</p>
          </div>
          
          <el-form ref="registerForm" :model="registerForm" :rules="registerRules" class="register-form" autocomplete="off">
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="请输入用户名"
                prefix-icon="el-icon-user"
                :validate-event="false"
                autocomplete="off"
              ></el-input>
            </el-form-item>
            
            <el-form-item prop="captcha">
              <div class="captcha-container">
                <el-input
                  v-model="registerForm.captcha"
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
            
            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请设置密码"
                prefix-icon="el-icon-lock"
                :validate-event="false"
                show-password
                autocomplete="new-password"
              ></el-input>
            </el-form-item>
            
            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                prefix-icon="el-icon-lock"
                :validate-event="false"
                autocomplete="new-password"
                show-password
              ></el-input>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="handleRegister" :loading="loading" class="register-button">
                {{ loading ? '注册中...' : '立即注册' }}
              </el-button>
            </el-form-item>
            
            <div class="login-link">
              <span>已有账号？</span>
              <el-button type="text" @click="toLogin" class="login-button-link">立即登录</el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '@/api/api'
import { showErrorMessage } from '@/utils/errorHandler'

export default {
  name: 'Register',
  data() {
    return {
      loading: false,
      registerForm: {
        username: '',
        captcha: '',
        password: '',
        confirmPassword: ''
      },
      captchaImage: '',
      captchaKey: '',
      brandFadeIn: false,
      formFadeIn: false,
      registerRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3-20位之间', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 6, message: '验证码长度在4-6位之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请设置密码', trigger: 'blur' },
          { min: 6, max: 20, message: '密码长度在6-20位之间', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              if (value !== this.registerForm.password) {
                callback(new Error('两次输入的密码不一致'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
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
  },
  beforeUnmount() {
    if (this.captchaImage && this.captchaImage.startsWith('blob:')) {
      URL.revokeObjectURL(this.captchaImage)
    }
  },
  methods: {
    // 获取验证码
    async getCaptcha() {
      try {
        // 清理之前的图片URL，避免内存泄漏
        if (this.captchaImage && this.captchaImage.startsWith('blob:')) {
          URL.revokeObjectURL(this.captchaImage)
        }
        
        // 显示加载状态
        this.captchaImage = ''
        
        const response = await authAPI.getCaptcha()
        
        // 检查响应是否成功
        if (response && response.status === 200) {
          // 从response.data中获取验证码数据
          this.captchaKey = response.data.captchaKey || ''
          this.captchaImage = response.data.captchaImage || ''
          
          if (!this.captchaKey || !this.captchaImage) {
            this.$message.warning('获取验证码不完整，请重试')
          }
        } else {
          showErrorMessage({response}, this, '获取验证码失败，请重试')
        }
      } catch (error) {
        showErrorMessage(error, this)
      }
    },
    
    // 处理注册
    async handleRegister() {
      this.$refs.registerForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            const { username, captcha, password } = this.registerForm
            
            // 构建注册请求数据
            const registerData = {
              username,
              password,
              captchaInput: captcha,
              captchaKey: this.captchaKey
            }
            
            const response = await authAPI.register(registerData)
            
            if (response.code === 200) {
              this.$message.success('注册成功，请登录')
              // 注册成功后跳转到登录页面
              this.$router.push('/login')
            } else {
              showErrorMessage({response}, this, '注册失败')
              // 注册失败后刷新验证码
              this.getCaptcha()
            }
          } catch (error) {
            showErrorMessage(error, this)
            // 注册失败后刷新验证码
            this.getCaptcha()
          } finally {
            this.loading = false
          }
        }
      })
    },
    
    // 跳转到登录页面
    toLogin() {
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* 注册容器 - 全屏样式 */
.register-container {
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


/* 注册包装器 */
.register-wrapper {
  display: flex;
  width: 100%;
  height: 100vh;
  min-height: 800px;
  overflow: hidden;
  z-index: 1;
  margin: 0;
  padding: 0;
}

/* 左侧背景图 */
.register-left {
  flex: 1;
  min-width: 350px;
  background-image: url('@/assets/login/loginbkg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  filter: blur(12px);
  -webkit-filter: blur(12px);
}

/* 背景图渐变模糊效果 - 消除分界线 */
.register-left::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.02) 15%,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.08) 35%,
    rgba(255, 255, 255, 0.12) 45%,
    rgba(255, 255, 255, 0.18) 55%,
    rgba(255, 255, 255, 0.25) 65%,
    rgba(255, 255, 255, 0.35) 75%,
    rgba(255, 255, 255, 0.45) 85%,
    rgba(255, 255, 255, 0.55) 95%,
    rgba(255, 255, 255, 0.6) 100%
  );
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  z-index: 1;
}

/* 左侧到右侧的虚化过渡 - 消除分界线 */
.register-left::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg, 
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.01) 20%,
    rgba(255, 255, 255, 0.03) 40%,
    rgba(255, 255, 255, 0.06) 60%,
    rgba(255, 255, 255, 0.1) 80%,
    rgba(255, 255, 255, 0.15) 100%
  );
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
  z-index: 2;
}

/* 右侧注册表单 */
.register-right {
  flex: 1;
  min-width: 350px;
  padding: 80px 60px;
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
  z-index: 3;
}

.register-form-container {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.register-header {
  margin-bottom: 40px;
  text-align: center;
}

.register-header h2 {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
}

.register-header p {
  font-size: 16px;
  color: #606266;
}

.register-form {
  width: 100%;
}

.register-form .el-form-item {
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

/* 注册按钮 */
.register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #606266;
}

.login-button-link {
  font-size: 14px;
  color: #409eff;
  padding: 0;
}

.login-button-link:hover {
  color: #66b1ff;
}

/* 淡入动画 */
.fade-in {
  opacity: 1;
}

/* 响应式调整 - 针对不同屏幕尺寸优化 */
@media (max-width: 1200px) {
  .register-wrapper {
    height: 100vh;
  }
  
  .register-right {
    padding: 60px 40px;
  }
}

@media (max-width: 992px) {
  .register-wrapper {
    width: 100%;
    height: 100vh;
  }
  
  .register-left {
    display: none;
  }
  
  .register-right {
    flex: 1;
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  .register-form-container {
    max-width: 400px;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .register-right {
    padding: 40px 30px;
  }
  
  .register-header h2 {
    font-size: 28px;
  }
  
  .captcha-container {
    flex-direction: column;
    align-items: stretch;
  }
  
  .captcha-image {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .register-container {
    padding: 0;
  }
  
  .register-right {
    padding: 30px 20px;
  }
  
  .register-header h2 {
    font-size: 24px;
  }
  
  .register-form {
    padding: 0 10px;
  }
  
  .register-form .el-form-item {
    margin-bottom: 16px;
  }
}

/* 确保在小屏幕设备上的全屏显示 */
@media (max-width: 480px) {
  .register-wrapper {
    min-height: 100vh;
    height: auto;
  }
  
  .register-right {
    min-height: 100vh;
    height: auto;
  }
}
</style>
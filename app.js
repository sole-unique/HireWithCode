const { createApp, ref, reactive, onMounted } = Vue;

// 获取 markdown 内容
async function fetchGuideMarkdown() {
    try {
        const response = await fetch('guide.md');
        return await response.text();
    } catch (error) {
        console.error('Error loading guide markdown:', error);
        return '';
    }
}

createApp({
    setup() {
        const step = ref(0);
        const guideMarkdown = ref('');

        // 表单数据
        const acceptForm = reactive({
            github: '',
            email: ''
        });
        const finishForm = reactive({
            repo: '',
            vercel: ''
        });

        // 校验与反馈
        const acceptError = ref('');
        const finishError = ref('');
        const finishSuccess = ref(false);

        // 加载 markdown 内容
        onMounted(async () => {
            guideMarkdown.value = await fetchGuideMarkdown();
            if (step.value === 0) {
                setTimeout(() => step.value = 1, 2000);
            }
        });

        // 进入下一步
        const nextStep = () => {
            step.value++;
        };

        // markdown渲染
        const renderMarkdown = (md) => {
            return marked.parse(md);
        };

        // 接受挑战表单提交
        const submitAccept = () => {
            acceptError.value = '';
            if (!acceptForm.github.trim() || !acceptForm.email.trim()) {
                acceptError.value = '请填写所有信息';
                return;
            }
            // 简单邮箱校验
            if (!/^[\w\-\.]+@[\w\-]+\.[\w\-]+$/.test(acceptForm.email)) {
                acceptError.value = '邮箱格式不正确';
                return;
            }
            nextStep();
        };

        // 完成挑战表单提交
        const submitFinish = () => {
            finishError.value = '';
            finishSuccess.value = false;
            if (!finishForm.repo.trim() || !finishForm.vercel.trim()) {
                finishError.value = '请填写所有信息';
                return;
            }
            // 简单URL校验
            if (!/^https?:\/\/.+/.test(finishForm.repo) || !/^https?:\/\/.+/.test(finishForm.vercel)) {
                finishError.value = '请输入正确的网址';
                return;
            }
            finishSuccess.value = true;
        };

        return {
            step,
            acceptForm,
            finishForm,
            acceptError,
            finishError,
            finishSuccess,
            nextStep,
            renderMarkdown,
            submitAccept,
            submitFinish,
            guideMarkdown
        };
    },
    template: `
        <div class="step-card" v-if="step === 0">
          <div class="logo-container">
            <img class="logo" src="./logo.png" alt="logo" />
            <div class="welcome-text">欢迎来到 infist 线上面试环节，期待你的加入！</div>
          </div>
        </div>
        <div class="step-card" v-else-if="step === 1">
          <div class="logo-container">
            <img class="logo" src="./logo.png" alt="logo" />
          </div>
          <div class="markdown-body" v-html="renderMarkdown(guideMarkdown)"></div>
          <button class="btn" @click="nextStep">下一步</button>
        </div>
        <div class="step-card" v-else-if="step === 2">
          <div class="logo-container">
            <img class="logo" src="./logo.png" alt="logo" />
          </div>
          <form @submit.prevent="submitAccept" style="width:100%">
            <div class="form-group">
              <label for="github">GitHub ID</label>
              <input id="github" v-model="acceptForm.github" autocomplete="off" placeholder="请输入你的 GitHub 用户名" />
            </div>
            <div class="form-group">
              <label for="email">邮箱</label>
              <input id="email" v-model="acceptForm.email" type="email" autocomplete="off" placeholder="请输入你的邮箱" />
            </div>
            <button class="btn" type="submit">接受挑战</button>
            <div v-if="acceptError" style="color:#ef4444;margin-top:10px;text-align:center;">{{acceptError}}</div>
          </form>
        </div>
        <div class="step-card" v-else-if="step === 3">
          <div class="logo-container">
            <img class="logo" src="./logo.png" alt="logo" />
          </div>
          <form @submit.prevent="submitFinish" style="width:100%">
            <div class="form-group">
              <label for="repo">GitHub 仓库 URL</label>
              <input id="repo" v-model="finishForm.repo" type="url" autocomplete="off" placeholder="https://github.com/your/repo" />
            </div>
            <div class="form-group">
              <label for="vercel">Vercel 在线体验地址</label>
              <input id="vercel" v-model="finishForm.vercel" type="url" autocomplete="off" placeholder="https://your-project.vercel.app" />
            </div>
            <button class="btn" type="submit">提交作品</button>
            <div v-if="finishError" style="color:#ef4444;margin-top:10px;text-align:center;">{{finishError}}</div>
            <div v-if="finishSuccess" class="success">🎉 作品已提交，感谢你的参与！</div>
          </form>
        </div>
      `
}).mount('#app'); 
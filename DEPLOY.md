# 部署指南：将OpenRouter Chat应用部署到GitHub Pages

## 步骤1：在GitHub上创建新仓库

1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 填写仓库信息：
   - Repository name: 例如 "openrouter-chat"
   - Description: 可选，例如 "OpenRouter Chat Application"
   - Visibility: 选择 "Public" 或 "Private"
   - 不要勾选 "Initialize this repository with a README"
   - 点击 "Create repository"

## 步骤2：推送代码到GitHub

创建仓库后，复制仓库的SSH或HTTPS URL，然后在终端中执行以下命令：

```bash
# 添加远程仓库（将 <repository-url> 替换为你的仓库URL）
git remote add origin <repository-url>

# 推送代码到GitHub
git push -u origin master
```

## 步骤3：启用GitHub Pages

1. 进入仓库设置页面
2. 点击左侧菜单中的 "Pages"
3. 在 "Build and deployment" 部分：
   - 选择 "Source" 为 "GitHub Actions"
   - 选择 "Static HTML" 工作流
   - 点击 "Configure" 并提交
4. 等待GitHub Actions完成构建和部署
5. 部署完成后，你将看到一个类似 `https://<username>.github.io/<repository-name>` 的URL

## 步骤4：访问应用

部署完成后，你可以通过GitHub Pages提供的URL访问你的OpenRouter Chat应用。

## 注意事项

- 确保在应用中输入正确的OpenRouter API密钥
- 应用将使用浏览器的localStorage存储API密钥，确保在安全的环境中使用
- 如果遇到部署问题，检查GitHub Actions的构建日志获取详细信息
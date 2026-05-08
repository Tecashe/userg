# 🚀 UGC-AI

**UGC-AI** is an AI-powered platform that generates realistic, high-quality user-generated content (UGC) for products. It combines product images with model images to create studio-quality visuals and short-form videos optimized for ads, social media, and e-commerce.

### Use Cases

- **E-commerce Product Photography**: Create lifestyle product images without expensive photoshoots
- **Social Media Content**: Generate engaging UGC-style content for marketing campaigns
- **Ad Creatives**: Produce authentic-looking ad creatives with real people using products
- **A/B Testing**: Quickly generate multiple variations of product images for testing

## 📸 Screenshots

| Home                        | Create                        |
| --------------------------- | ----------------------------- |
| ![](./screenshots/home.png) | ![](./screenshots/create.png) |

| Community                        | Plans                        |
| -------------------------------- | ---------------------------- |
| ![](./screenshots/community.png) | ![](./screenshots/plans.png) |

| Generations                        |
| ---------------------------------- |
| ![](./screenshots/generations.png) |

## ✨ Features

### Core Features

- 🧠 **AI-powered image generation** (product + model blending)
- 🎬 **AI-generated short-form videos**
- 📦 **Project management** (create, view, publish, delete)
- 🔐 **Authentication** using Clerk
- 💳 **Credit-based usage system** (Pro: 80 credits, Premium: 240 credits)
- ☁️ **Cloud media storage** (Cloudinary)
- ⚡ **Real-time generation status** (polling)
- 🧾 **Error monitoring** with Sentry

### Technical Features

- 🚦 **Rate limiting** - Prevent abuse with request throttling
- 🛡️ **Type safety** - Full TypeScript support across backend and frontend
- 📝 **Webhook integration** - Clerk webhooks for user sync and payment processing
- 🐛 **Error tracking** - Sentry integration for production error monitoring
- 💾 **Database ORM** - Prisma for type-safe database operations
- 🔐 **Security** - CORS, and input sanitization

## 🛠️ Tech Stack

### Frontend

- React (TypeScript)
- Tailwind CSS
- Axios
- React Router
- Clerk (Auth)

### Backend

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL / MongoDB (based on your setup)
- Clerk (Auth middleware)
- Multer (File upload handling)
- Sentry (error tracking)

### AI & Storage

- OpenRouter - Black Forest Labs FLUX.2 Pro (Image generation)
- Replicate - MiniMax Video-01 (Video generation)
- Cloudinary (Image & video storage + CDN)
- Clerk (Authentication & user management)

---

### Data Flow - Image Generation

1. User uploads 2 images (product + person)
2. Backend validates and deducts credits (5 credits per generation)
3. Images are uploaded to Cloudinary
4. A project scaffold is created with uploaded images and saved to the database (isGenerating = true)
5. AI model generates a combined image
6. Generated image uploaded to Cloudinary
7. Project is updated with the generated image and status (isGenerating = false)
8. If generation fails, credits are refunded and project is updated with error-state and status (isGenerating = false)

### Data Flow - Video Generation

1. User requests video generation for an existing project
2. Backend validates and deducts credits (10 credits per generation)
3. Project is locked (isGenerating = true) to prevent duplicate generation
4. AI service generates video using generated image as base
5. Generated video is downloaded temporarily to local storage
6. Video is uploaded to Cloudinary
7. Project is updated with generatedVideo URL and status (isGenerating = false)
8. Temporary video file is deleted from local storage
9. If generation fails, credits are refunded and project is updated with error-state and status (isGenerating = false)

## 🔐 Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ugc_ai"
# OR for MongoDB
# DATABASE_URL="mongodb://localhost:27017/ugc_ai"

# Clerk Authentication
CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
CLERK_WEBHOOK_SIGNING_SECRET="your_clerk_webhook_signing_secret"

# Cloudinary
CLOUDINARY_URL="your_cloudinary_url"

# AI API-Keys
OPENROUTER_API_KEY="your_openrouter_api_key"
REPLICATE_API_TOKEN="your_replicate_api_token"

# Sentry (Optional)
SENTRY_DSN="your_sentry_dsn"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 📚 API Documentation

### Authentication

All API routes require JWT token from Clerk in the `Authorization` header:

```
Authorization: Bearer <clerk_jwt_token>
```

### Endpoints

#### User Routes

| Method | Endpoint                        | Description                | Auth |
| ------ | ------------------------------- | -------------------------- | ---- |
| GET    | `/api/user/credits`             | Get user credit balance    | ✅   |
| GET    | `/api/user/projects`            | Get user's projects        | ✅   |
| GET    | `/api/user/projects/:projectId` | Get specific project       | ✅   |
| PATCH  | `/api/user/publish/:projectId`  | Toggles published projects | ✅   |

#### Project Routes

| Method | Endpoint                      | Description            | Auth |
| ------ | ----------------------------- | ---------------------- | ---- |
| POST   | `/api/project/generate/image` | Generate new UGC image | ✅   |
| POST   | `/api/project/generate/video` | Generate UGC video     | ✅   |
| DELETE | `/api/project/:projectId`     | Delete project         | ✅   |
| GET    | `/api/project/published`      | Get published projects | ❌   |

## 🔔 Webhooks

### Clerk Webhook Events

The application listens to the following Clerk webhook events:

| Event                    | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `user.created`           | Create user in local database              |
| `user.updated`           | Update user information                    |
| `user.deleted`           | Remove user from database                  |
| `paymentAttempt.updated` | Handle successful payments and add credits |

## 🚢 Deployment

- Backend to Render
- Frontend to Vercel

## 📈 Future Improvements

- 🔄 **Real-time updates** (WebSockets instead of polling)
- 📊 **Analytics dashboard** for tracking generation metrics
- 🧠 **Better prompt customization** with presets and templates
- 📱 **Mobile optimization** for on-the-go content creation
- 💬 **AI script + voice generation** for video content
- 🎨 **Bulk generation** for batch processing
- 🔁 **Webhook retry mechanism** for failed deliveries
- 📱 **Mobile app** (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**

2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes**

```bash
git commit -m 'Add some amazing feature'
```

4. **Push to branch**

```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation accordingly
- Use conventional commit messages
- Run linting before committing: `npm run lint`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Inspiration

UGC-AI aims to simplify content creation by eliminating the need for expensive photoshoots and production setups, making high-quality marketing content accessible to everyone.

## 👨‍💻 Author

Built with focus on real-world scalability, clean architecture, and modern AI integration.

## 🙏 Acknowledgments

- [Clerk](https://clerk.com/) for seamless authentication
- [Cloudinary](https://cloudinary.com/) for image optimization and CDN
- [Prisma](https://www.prisma.io/) for excellent ORM experience
- [Sentry](https://sentry.io/) for error monitoring
- [OpenRouter](https://openrouter.ai/black-forest-labs/flux.2-pro) for image generation capabilities
- [Replicate](https://replicate.com/minimax/video-01?input=nodejs) for video generation capabilities

## 📧 Contact & Support

- **Gmail**: vasu.singhal.work@gmail.com

---

**Built with ❤️ for the UGC creator community**

⭐ Star this repo if you find it useful!

---

## 📝 Changelog

### v1.0.0 (Current)

- Initial release
- AI-powered image generation
- Video generation support
- Credit system implementation
- Clerk authentication integration
- Cloudinary storage integration
- Real-time polling for generation status
- Sentry error monitoring

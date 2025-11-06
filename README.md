
# 🤖 AI Lecture Mate (AI 강의 요약 비서)
> AI를 활용하여 강의나 회의 녹음 파일을 텍스트로 변환하고, 핵심만 요약해주는 웹 애플리케이션

**[🔗 Demo 바로가기](https://duckcchun.github.io/ai-lecture-mate/)**

---
<br>

## 🔍 한줄 소개
음성 녹음부터 텍스트 변환(STT), AI 요약, 데이터베이스 저장까지의 **자동화된 파이프라인**을 구축하여, 학습 및 업무 생산성을 극대화하는AI 기반 학습 비서 서비스입니다.

---
<br>

## 🧰 기술 스택
- **Language:** TypeScript
- **Framework:** React, Vite
- **Styling:** Tailwind CSS, Radix UI
- **Database / Storage:** Supabase (Database & File Storage)
- **External API:** OpenAI (Whisper API, GPT API)
- **Deployment:** GitHub Pages

---
<br>

## ✨ 주요 기능
- **브라우저 기반 음성 녹음:** `MediaRecorder` API를 활용하여 사용자의 마이크로 실시간 음성을 녹음하고 오디오 파일을 생성합니다.
- **AI 텍스트 변환 (STT):** 녹음된 오디오 파일을 OpenAI의 **Whisper API**로 전송하여, 강의 내용을 정확한 텍스트로 변환합니다.
- **AI 핵심 요약:** 텍스트로 변환된 스크립트를 **GPT API**로 전송하여, 긴 강의 내용의 핵심만 간추린 요약본을 생성합니다.
- **데이터 관리:** 생성된 오디오 파일은 **Supabase Storage**에, 변환된 텍스트와 요약본은 **Supabase Database**에 저장하여 체계적으로 관리합니다.

---
<br>

## 🚀 설치 및 실행 (로컬)

```bash
# 1. 저장소 클론
git clone [https://github.com/Duckcchun/ai-lecture-mate.git](https://github.com/Duckcchun/ai-lecture-mate.git)

# 2. 폴더 이동
cd ai-lecture-mate

# 3. 의존성 설치
npm install

# 4. 개발 서버 실행
npm run dev
````

**환경변수 설정:**
프로젝트 루트에 `.env` 파일을 생성하고, Supabase 및 OpenAI에서 발급받은 API 키를 아래와 같이 추가해야 합니다.

```
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
VITE_OPENAI_API_KEY="YOUR_OPENAI_API_KEY"
```

-----

<br>

## 📂 폴더 구조

```
/
├─ public/
├─ src/
│  ├─ components/  # 재사용 가능한 UI 컴포넌트 (요약 카드, 녹음기 버튼 등)
│  │   └─ ui/      # Radix UI 기반 기본 컴포넌트
│  ├─ hooks/       # useRecorder.ts 등 커스텀 훅
│  ├─ services/    # supabase.ts, openai.ts 등 API 연동 로직
│  ├─ types/       # TypeScript 타입 정의
│  ├─ App.tsx      # 메인 애플리케이션 컴포넌트
│  └─ main.tsx     # 애플리케이션 진입점
├─ .gitignore
├─ package.json
└─ vite.config.ts
```

-----

<br>

## 📈 앞으로의 계획 (Roadmap)

  - [ ] **실시간 텍스트 변환:** 녹음과 동시에 텍스트가 변환되는 Live Transcription 기능 추가
  - [ ] **요약본 편집 및 수정:** AI가 생성한 요약본을 사용자가 직접 수정하고 저장하는 기능
  - [ ] **키워드 추출:** 변환된 텍스트에서 AI를 이용해 주요 키워드를 추출하는 기능

-----

<br>

## 📸 스크린샷

*(스크린샷을 추가 예정)*

-----

<br>

## 📬 Contact

  - **GitHub:** [@Duckcchun](https://github.com/Duckcchun)
  - **Email:** (qasw1733@gmail.com)


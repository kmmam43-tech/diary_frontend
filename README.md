# Web

도전행동을 입력하고 두 OpenAI Agent의 지원을 받아 중재방안을 확정하는 JavaScript 기반 정적 프론트엔드입니다. Firestore나 OpenAI에 직접 연결하지 않고 FastAPI 백엔드만 호출합니다.

## 로컬 실행

```powershell
npm install
npm run dev
```

브라우저에서 `http://localhost:8080`에 접속합니다. 백엔드는 기본적으로 `http://localhost:8000`을 사용하며, 다른 주소를 쓰려면 `config.js`의 `API_BASE_URL`을 변경합니다.

## 테스트

```powershell
npm test
```

## Netlify

이 폴더를 Netlify 사이트의 Base directory로 지정하면 `netlify.toml`에 따라 정적 파일이 배포됩니다. 배포 전 `config.js`의 API 주소를 Google Cloud에 배포된 백엔드 HTTPS 주소로 변경해야 합니다.

var DOCS_AI_URL = document.currentScript.getAttribute('docs-url') || 'https://docsai.app';


function toggleChat() {
  const chatIframe = document.getElementById("chat-iframe");
  const chatButton = document.getElementById("chat-button");
  if (chatIframe && chatButton) {
    if (chatIframe.style.display === "block") {
      chatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="margin-top: 4px;" viewBox="0 0 24 24" height="25" width="25" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clip-rule="evenodd" /></svg>';
    } else {
      chatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" height="25" width="25" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
    }
    chatIframe.style.display =
      chatIframe.style.display === "block" ? "none" : "block";
  }
}

function getChatChatButton(primaryColor, textColor = '#fff') {
  const chatButton = document.createElement("button");
  chatButton.id = "chat-button";
  chatButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" style="margin-top: 4px;" viewBox="0 0 24 24" height="25" width="25" fill="currentColor" class="w-6 h-6"><path fill-rule="evenodd" d="M12 2.25c-2.429 0-4.817.178-7.152.521C2.87 3.061 1.5 4.795 1.5 6.741v6.018c0 1.946 1.37 3.68 3.348 3.97.877.129 1.761.234 2.652.316V21a.75.75 0 001.28.53l4.184-4.183a.39.39 0 01.266-.112c2.006-.05 3.982-.22 5.922-.506 1.978-.29 3.348-2.023 3.348-3.97V6.741c0-1.947-1.37-3.68-3.348-3.97A49.145 49.145 0 0012 2.25zM8.25 8.625a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm2.625 1.125a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clip-rule="evenodd" /></svg>';
  if (primaryColor) {
    chatButton.style.backgroundColor = primaryColor;
  } if (textColor) {
    chatButton.style.color = textColor;
  }
  chatButton.addEventListener("click", toggleChat);
  return chatButton;
}

function createChatIframe(projectId, options) {
  const chatIframe = document.createElement("iframe");
  chatIframe.id = "chat-iframe";
  chatIframe.src = `${DOCS_AI_URL}/embed/chat/${projectId}?${objectToQueryString(options)}`;
  return chatIframe;
}

async function initDocsAI(projectId, primaryColor, url) {
  const DOCS_AI_STYLE = `
  #chat-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background-color: #3498db;
    color: white;
    text-align: center;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  #mobile-chat-close {
    display: none;
  }
  
  #chat-iframe {
    display: none;
    position: fixed;
    bottom: 90px;
    right: 20px;
    width: 400px;
    height: 80vh;
    border: none;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1001;
  }
  
  
  @media (max-width: 768px) {
    #chat-iframe {
      width: 100%;
      right: 0;
      height: 100%;
      bottom: 0;
    }
  
    #mobile-chat-close {
      display: block;
      position: fixed;
      top: 5px;
      right: 5px;
    }
  }
  `

  if (typeof window !== "undefined" && document.getElementById("docsai-root") === null) {
    const root = document.createElement("div");
    root.id = "docsai-root";
    root.className = "docsai-root";
    const projectData = await getRequest(url, 'web/project', { projectId })

    root.appendChild(getChatChatButton(primaryColor, projectData?.textColor));
    root.appendChild(createChatIframe(projectId, { primaryColor }));
    console.log('docsai chat loaded 1')

    if (document.body) {
      console.log('docsai chat loaded 2')
      document.body.appendChild(root);
      const style = document.createElement('style');
      style.innerText = DOCS_AI_STYLE;
      document.head.appendChild(style)
    }

    document.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(root);
      const style = document.createElement('style');
      style.innerText = DOCS_AI_STYLE;
      document.head.appendChild(style)
    });

    window.addEventListener('message', (ev) => {
      if (ev.data?.source === 'docsai' && ev.data?.message === 'close') {
        const chatIframe = document.getElementById("chat-iframe");
        if (chatIframe && chatIframe.style.display === 'block') {
          toggleChat()
        }
      }
    }, false)
  }
}

(function () {
  console.log('docsai chat loaded')
  const projectId = document.currentScript.getAttribute('project-id');
  const primaryColor = document.currentScript.getAttribute('primary-color');
  const docsAiUrl = document.currentScript.getAttribute('docs-url') || 'https://docsai.app';
  initDocsAI(projectId, primaryColor, docsAiUrl);
})();

function objectToQueryString(obj) {
  let queryString = '';
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (queryString.length > 0) {
        queryString += '&';
      }
      queryString += `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
    }
  }
  return queryString;
}

async function getRequest(url, endpoint, queryParams) {
  try {

    const response = await fetch(`${DOCS_AI_URL}/api/${endpoint}?${new URLSearchParams(queryParams)}`)
    const data = await response.json()
    console.log("🔥 ~ getRequest ~ data:", data)
    return data
  }
  catch (err) {
    console.error(err)
    return null
  }
}


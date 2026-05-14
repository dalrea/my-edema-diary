/* =========================================================
   나의 부종일기 — 데모 스크립트
   ========================================================= */

(function () {
    'use strict';

    /* ---------- 유틸 ---------- */
    const $  = (sel, parent = document) => parent.querySelector(sel);
    const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

    function todayISO() {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    /* ---------- 1. CTA 부드러운 스크롤 ---------- */
    function initScrollButtons() {
        $$('[data-scroll-to]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-scroll-to');
                const target = document.getElementById(id);
                if (!target) return;
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /* ---------- 1-1. 모바일 햄버거: 항목 클릭 시 메뉴 닫기 ---------- */
    function initMobileNav() {
        const toggle = $('#navToggle');
        const nav    = $('.site-nav');
        if (!toggle || !nav) return;

        $$('a', nav).forEach((link) => {
            link.addEventListener('click', () => {
                toggle.checked = false;
            });
        });
    }

    /* ---------- 2. 기록 폼 ---------- */
    const STORAGE_KEY = 'budongDiary.records';

    function loadRecords() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveRecord(record) {
        try {
            const list = loadRecords();
            list.push(record);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            // localStorage 사용 불가 환경은 무시 (데모이므로 화면 반응은 그대로 동작)
        }
    }

    function initRecordForm() {
        const form = $('#recordForm');
        if (!form) return;

        const dateInput = $('#date', form);
        if (dateInput && !dateInput.value) dateInput.value = todayISO();

        const successBox = $('#recordSuccess');

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const data = {
                date:        $('#date', form).value || todayISO(),
                sleep:       $('#sleep', form).value,
                water:       $('#water', form).value,
                swelling:    $('#swelling', form).value,
                stress:      $('#stress', form).value,
                exercise:    $('#exercise', form).value,
                compression: $('#compression', form).value,
                feeling:     $('#feeling', form).value,
                savedAt:     new Date().toISOString(),
            };

            saveRecord(data);

            // 완료 메시지 표시
            if (successBox) {
                successBox.hidden = false;
                successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    /* ---------- 3. 그래프 ---------- */
    const GRAPH_DATA = [
        { day: '월', value: '보통' },
        { day: '화', value: '심함' },
        { day: '수', value: '보통' },
        { day: '목', value: '좋음' },
        { day: '금', value: '좋음' },
        { day: '토', value: '보통' },
        { day: '일', value: '좋음' },
    ];

    const STATUS_MAP = {
        '좋음': { height: 45,  cls: 'bar-good' },
        '보통': { height: 70,  cls: 'bar-normal' },
        '심함': { height: 95,  cls: 'bar-bad' },
    };

    function renderChart() {
        const chart = $('#chart');
        if (!chart) return;

        chart.innerHTML = '';

        GRAPH_DATA.forEach((item, idx) => {
            const meta = STATUS_MAP[item.value] || STATUS_MAP['보통'];

            const wrap = document.createElement('div');
            wrap.className = 'bar-wrap';

            const bar = document.createElement('div');
            bar.className = `bar ${meta.cls}`;
            bar.setAttribute('role', 'presentation');
            bar.style.height = '0%';

            const value = document.createElement('span');
            value.className = 'bar-value';
            value.textContent = item.value;

            const label = document.createElement('span');
            label.className = 'bar-label';
            label.textContent = item.day;

            bar.appendChild(value);
            wrap.appendChild(bar);
            wrap.appendChild(label);
            chart.appendChild(wrap);

            // 진입 시 막대가 자라나는 애니메이션
            requestAnimationFrame(() => {
                setTimeout(() => {
                    bar.style.height = meta.height + '%';
                }, 80 * idx);
            });
        });
    }

    /* ---------- 4. 마음챙김 응원 문장 ---------- */
    const QUOTES = [
        '“오늘의 작은 관리가, 내일의 가벼움을 만듭니다.”',
        '“몸이 힘든 날에도 나는 나를 포기하지 않았어요.”',
        '“기록은 나를 살펴보는 일이에요. 나를 더 잘 이해하기 위해서요.”',
        '“천천히 가도 괜찮아요. 꾸준함이 가장 큰 치료가 됩니다.”',
    ];

    function initQuoteButton() {
        const btn   = $('#quoteBtn');
        const quote = $('#mindfulQuote');
        if (!btn || !quote) return;

        let lastIdx = -1;

        btn.addEventListener('click', () => {
            let idx = Math.floor(Math.random() * QUOTES.length);
            // 같은 문장이 연속으로 안 나오게
            if (QUOTES.length > 1 && idx === lastIdx) {
                idx = (idx + 1) % QUOTES.length;
            }
            lastIdx = idx;

            quote.classList.add('fade');
            setTimeout(() => {
                quote.innerHTML = QUOTES[idx];
                quote.classList.remove('fade');
            }, 220);
        });
    }

    /* ---------- 5. 커뮤니티 출석 ---------- */
    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[ch]));
    }

    function initCommunityForm() {
        const form = $('#communityForm');
        const list = $('#communityList');
        if (!form || !list) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const nicknameEl = $('#nickname', form);
            const messageEl  = $('#message', form);

            const nickname = (nicknameEl.value || '').trim();
            const message  = (messageEl.value  || '').trim();

            if (!nickname || !message) {
                if (!nickname) nicknameEl.focus();
                else messageEl.focus();
                return;
            }

            const li = document.createElement('li');
            li.className = 'community-item';
            li.innerHTML = `
                <div class="community-meta">
                    <span class="community-name">${escapeHtml(nickname)}</span>
                    <span class="community-time">방금</span>
                </div>
                <p class="community-text">${escapeHtml(message)}</p>
            `;
            list.prepend(li);

            messageEl.value = '';
            messageEl.focus();
        });
    }

    /* =========================================================
       AI 모듈 (데모용 규칙 기반)
       - 실제 API 호출 없음. 추후 OpenAI 등으로 교체할 때
         아래 generate* / summarize* / show* 함수만 비동기로
         바꾸면 됨.
       ========================================================= */

    /* ---------- AI 1. 마음챙김 문장 생성 ---------- */
    const MIND_MESSAGES = {
        '괜찮아요': '오늘 하루를 무사히 보낸 것만으로도 충분해요. 가볍게 남긴 한 줄이 내 몸을 이해하는 첫걸음이 됩니다.',
        '지쳤어요': '지친 날에는 많이 해내지 않아도 괜찮아요. 쉬는 것도 분명한 관리이고, 나를 돌보는 방법이에요.',
        '불안해요': '불안한 마음이 드는 건 자연스러운 일이에요. 오늘의 상태를 가볍게 적어두면, 내 몸을 조금 더 차분히 바라볼 수 있어요.',
        '뿌듯해요': '오늘 해낸 작은 관리가, 내일의 가벼움을 만듭니다. 잘 해내고 있는 자신을 충분히 칭찬해 주세요.',
    };

    function generateMindCareMessage(mood) {
        if (!mood) return null;
        return MIND_MESSAGES[mood] || MIND_MESSAGES['괜찮아요'];
    }

    function initAiMind() {
        const group   = $('#moodOptions');
        const btn     = $('#aiMindBtn');
        const result  = $('#aiMindResult');
        const title   = $('#aiMindResultTitle');
        const textEl  = $('#aiMindResultText');
        if (!group || !btn || !result || !textEl) return;

        let selectedMood = null;

        $$('.mood-btn', group).forEach((b) => {
            b.addEventListener('click', () => {
                selectedMood = b.dataset.mood;
                $$('.mood-btn', group).forEach((x) => {
                    const active = x === b;
                    x.classList.toggle('is-active', active);
                    x.setAttribute('aria-checked', active ? 'true' : 'false');
                });
            });
        });

        btn.addEventListener('click', () => {
            if (!selectedMood) {
                // 미선택 시 부드럽게 안내
                title.textContent = '오늘의 기분을 먼저 골라볼까요?';
                textEl.textContent = '괜찮아요 · 지쳤어요 · 불안해요 · 뿌듯해요 중 하나를 골라주세요.';
                result.hidden = false;
                return;
            }
            const msg = generateMindCareMessage(selectedMood);
            title.textContent = `오늘 마음에 닿는 한마디 — “${selectedMood}”`;
            textEl.textContent = msg;
            result.hidden = false;
        });
    }

    /* ---------- AI 2. 기록 도우미 ---------- */
    // 간단한 규칙 기반 분류 — 향후 LLM 호출로 교체 가능
    function summarizeRecord(rawText) {
        if (!rawText || !rawText.trim()) return null;
        const text = rawText.trim();

        const items = [];

        // 운동
        const exerciseMatch = text.match(/(\d+\s*(?:분|시간))\s*(?:동안)?\s*(걷|산책|스트레칭|요가|수영|운동|자전거)/);
        if (exerciseMatch) {
            const kind = exerciseMatch[2].includes('걷') ? '걷기' : exerciseMatch[2];
            items.push({ label: '운동', value: `${exerciseMatch[1]} ${kind}` });
        } else if (/걷|산책|스트레칭|요가|수영|운동|자전거/.test(text)) {
            items.push({ label: '운동', value: '오늘 몸을 움직였어요' });
        }

        // 압박 관리
        if (/압박\s*스타킹|압박스타킹|붕대|압박/.test(text)) {
            const compTime = text.match(/(\d+\s*시간)\s*(?:동안)?\s*(?:착용|입|찼)/);
            items.push({
                label: '압박 관리',
                value: compTime ? `압박 ${compTime[1]} 착용` : '압박 관리를 챙겼어요',
            });
        }

        // 부종 느낌
        if (/무겁|뻐근|땡땡|빵빵|부어|부었|부종|당김/.test(text)) {
            items.push({ label: '부종 느낌', value: '다리가 조금 무거웠어요' });
        } else if (/가벼|편안|괜찮/.test(text)) {
            items.push({ label: '부종 느낌', value: '비교적 가벼웠어요' });
        }

        // 수면 / 수분
        if (/잠|수면|잤|졸/.test(text)) {
            items.push({ label: '수면', value: '수면에 대한 메모가 있어요' });
        }
        if (/물|수분|음용|마셨/.test(text)) {
            items.push({ label: '수분 섭취', value: '오늘 물을 챙겨 드셨네요' });
        }

        // 비어 있으면 fallback
        if (items.length === 0) {
            items.push({ label: '오늘의 한 줄', value: '메모가 잘 남겨졌어요' });
        }

        items.push({
            label: '내일 함께 살펴보면 좋아요',
            value: '수면 시간, 수분 섭취, 압박 착용 시간',
        });

        return items;
    }

    function initAiHelper() {
        const input  = $('#aiHelperInput');
        const btn    = $('#aiHelperBtn');
        const result = $('#aiHelperResult');
        const list   = $('#aiHelperSummary');
        if (!input || !btn || !result || !list) return;

        btn.addEventListener('click', () => {
            const items = summarizeRecord(input.value);
            if (!items) {
                input.focus();
                return;
            }

            list.innerHTML = '';
            items.forEach((it) => {
                const li = document.createElement('li');
                li.innerHTML = `<strong>${escapeHtml(it.label)}:</strong>${escapeHtml(it.value)}`;
                list.appendChild(li);
            });
            result.hidden = false;
        });
    }

    /* ---------- AI 3. 관리 힌트 ---------- */
    function generateCareHint() {
        // 가상의 최근 기록 기반 메시지 (추후 실데이터 + LLM으로 교체)
        return '최근 기록을 살펴보니, 수면 시간과 압박 착용 시간, 활동량이 부종 느낌과 함께 자주 보였어요. 내일은 수면 시간과 압박 착용 시간을 함께 적어보면 좋을 것 같아요.';
    }

    function initAiHint() {
        const btn    = $('#aiHintBtn');
        const result = $('#aiHintResult');
        const text   = $('#aiHintResultText');
        if (!btn || !result || !text) return;

        btn.addEventListener('click', () => {
            text.textContent = generateCareHint();
            result.hidden = false;
            result.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    }

    /* ---------- AI 4. 정보 안내 ---------- */
    const INFO_GUIDES = {
        compression: {
            title: '압박 관리',
            text: '압박 스타킹이나 붕대를 신은 시간, 그날의 불편감, 벗고 난 뒤의 변화를 함께 적어두면 나에게 맞는 관리 패턴을 찾아가는 데 도움이 됩니다.',
        },
        exercise: {
            title: '운동과 스트레칭',
            text: '어떤 운동을 얼마나 했는지, 운동 후 다리 느낌이 어땠는지를 함께 적어두면, 나에게 잘 맞는 활동량을 천천히 찾아갈 수 있어요.',
        },
        cellulitis: {
            title: '봉와직염 주의 신호',
            text: '열감, 붉어짐, 통증, 갑작스러운 부종 악화, 발열 같은 신호가 보인다면 기록보다 먼저 의료진과 상담해 주세요. 빠른 확인이 가장 중요한 관리입니다.',
        },
        visit: {
            title: '진료 전 기록 준비',
            text: '최근 부종의 변화, 줄자나 인바디 수치, 감염 여부, 압박 착용 시간, 운동 기록을 미리 정리해 두면, 진료실에서 내 상태를 설명하기가 한결 수월해져요.',
        },
    };

    function showInfoGuide(type) {
        return INFO_GUIDES[type] || null;
    }

    function initAiInfo() {
        const grid   = $('#aiInfoGrid');
        const result = $('#aiInfoResult');
        const titleEl = $('#aiInfoTitle');
        const textEl  = $('#aiInfoText');
        if (!grid || !result || !titleEl || !textEl) return;

        $$('.ai-info-card', grid).forEach((card) => {
            card.addEventListener('click', () => {
                const type = card.dataset.info;
                const guide = showInfoGuide(type);
                if (!guide) return;

                $$('.ai-info-card', grid).forEach((c) => c.classList.remove('is-active'));
                card.classList.add('is-active');

                titleEl.textContent = guide.title;
                textEl.textContent = guide.text;
                result.hidden = false;
                result.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    }

    /* ---------- AI 5. 기록 폼과 연결: 오늘 기록 정리 ---------- */
    function summarizeTodayForm() {
        const form = $('#recordForm');
        if (!form) return null;

        const fields = {
            수면:    $('#sleep', form).value,
            수분:    $('#water', form).value,
            운동:    $('#exercise', form).value.trim(),
            압박:    $('#compression', form).value,
            부종:    $('#swelling', form).value,
            스트레스: $('#stress', form).value,
            느낀점:  $('#feeling', form).value.trim(),
        };

        const filled = Object.entries(fields)
            .filter(([, v]) => v !== '' && v != null)
            .map(([k]) => k);

        if (filled.length === 0) {
            return '아직 적힌 내용이 없어요. 한두 가지만 골라 적어도 충분합니다. 천천히 시작해 보세요.';
        }

        // 사람 친화적인 항목명 매핑
        const labelMap = {
            수면: '수면',
            수분: '수분 섭취',
            운동: '운동',
            압박: '압박 관리',
            부종: '부종 정도',
            스트레스: '피로 · 스트레스',
            느낀점: '오늘 느낀 점',
        };

        const friendly = filled.map((k) => labelMap[k] || k).join(', ');

        return `오늘은 ${friendly}을(를) 남기셨네요. 내일도 같은 항목을 함께 기록해 두면, 부종의 흐름을 한결 또렷하게 살펴볼 수 있어요.`;
    }

    function initTodaySummarizer() {
        const btn    = $('#summarizeTodayBtn');
        const result = $('#todaySummary');
        const text   = $('#todaySummaryText');
        if (!btn || !result || !text) return;

        btn.addEventListener('click', () => {
            text.textContent = summarizeTodayForm();
            result.hidden = false;
        });
    }

    /* ---------- 초기화 ---------- */
    document.addEventListener('DOMContentLoaded', () => {
        initScrollButtons();
        initMobileNav();
        initRecordForm();
        renderChart();
        initQuoteButton();
        initCommunityForm();

        // AI 도우미
        initAiMind();
        initAiHelper();
        initAiHint();
        initAiInfo();
        initTodaySummarizer();
    });
})();

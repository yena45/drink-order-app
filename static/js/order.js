document.addEventListener('DOMContentLoaded', function () {
    const sizeSection = document.getElementById('size-section');
    const sizeInput = document.getElementById('size');
    const beanOptions = document.getElementById('bean-options');
    const drinkInput = document.getElementById('drink-input');
    const suggestions = document.getElementById('suggestions');
    const beanSection = document.getElementById('bean-section');
    const beanError = document.getElementById('bean-error');
    const beanSelect = document.getElementById('bean');

    let drinkList = [];
    let coffeeDrinks = [];

    const menuMap = {
        B1: {
            drinks: [
                '아메리카노', '카페 라떼', '바닐라빈 라떼', '헤이즐넛 라떼', '돌체 라떼',
                '바나나 라떼', '더블초콜릿 모카', '콜드브루', '콜드 브루 라떼',
                '파파야 블렌딩', '오렌지베리 블렌딩', '레몬그라스 블렌딩', '스윗루이보스 블렌딩',
                '오미자 차', '매실 차', '자몽 차', '레몬 차', '배.도라지.대추 차',
                '패션후르츠 칸티노', '딸기 칸티노', '플레인 요거트 칸티노', '망고 요거트 칸티노',
                '오미자 에이드', '매실 에이드', '자몽 에이드', '망고패션후르츠 에이드',
                '그린애플 모히또', '딸기 모히또', '초콜릿', '토피넛 라떼',
                '칸틴 밀크티', '아이스티', '딸기듬뿍 우유', '제주말차 라떼'
            ],
            coffeeDrinks: [
                '아메리카노', '카페 라떼', '바닐라빈 라떼', '헤이즐넛 라떼',
                '돌체 라떼', '바나나 라떼', '더블초콜릿 모카'
            ],
            beans: [
                '원두001 (묵직한바디의 강한로스팅)',
                '원두002 (부드러운산미의 미디엄로스팅)',
                '디카페인원두'
            ],
            img: 'menu.jpg',
            freeInput: false
        },
        '2F': {
            drinks: [
                '에스프레소', '아메리카노', '스테이트 미엘 블랜드',
                '카페 라떼', '카푸치노', '아인슈페너', '피스타치오 크림 라떼',
                '바닐라 라떼', '카페 모카', '연유 라떼', '두유 라떼',
                '바닐라빈 라떼', '오트 라떼', '스카치 버터 크림 라떼',

                '클래식 루이보스', '글로우 히비스커스', '젠틀 캐모마일',
                '브리즈 페퍼민트', '블루밍 그린', '조선 브렉퍼스트',
                '루이보스 바닐라', '얼 그레이', '그린 루바브',

                '애플 시나몬 유자차', '오미자 히비스커스 티', '진저 레몬 티',
                '히비스커스 뱅쇼 티', '유자 민트 티', '허니 자몽 그린티',

                '복숭아 아이스 티', '유자차', '미숫가루 라떼', '청귤차',
                '쌍화차', '밀크티', '초콜릿 라떼', '시나몬 라떼', '밤 라떼',
                '초당옥수수 라떼', '쑥 라떼', '말차 라떼', '쌀 라떼',

                '유자 에이드', '청귤 에이드', '유자 슬러시',
                '자몽 에이드', '플레인 요거트 스무디'
            ],
            coffeeDrinks: [
                '에스프레소', '아메리카노', '스테이트 미엘 블랜드',
                '카페 라떼', '카푸치노', '아인슈페너',
                '피스타치오 크림 라떼', '바닐라 라떼', '카페 모카',
                '연유 라떼', '두유 라떼', '스카치 버터 크림 라떼',
                '바닐라빈 라떼', '오트 라떼'
            ],
            beans: [
                '콜롬비아 유기농',
                '스테이트 미엘',
                '디카페인원두'
            ],
            img: '2F_menu.jpeg',
            freeInput: false
        },
        SB: {
            drinks: [],
            coffeeDrinks: [],
            beans: [],
            img: null,
            freeInput: true
        }
    };

    function normalize(text) {
        return text.toLowerCase().replace(/\s+/g, '');
    }

    function cleanDrinkName(text) {
        return text.replace(/(아이스|핫|뜨거운|따뜻한)\s*/gi, '').trim();
    }

    function getSelectedLocation() {
        return document.querySelector('input[name="location"]:checked')?.value || '';
    }

    function getSelectedConfig() {
        return menuMap[getSelectedLocation()];
    }

    function resetBeanSection() {
    beanSection.style.display = 'none';
    beanError.style.display = 'none';
    beanSelect.value = '';

    document.querySelectorAll('.bean-option').forEach((el) => {
        el.classList.remove('selected');
    });
}

    function updateMenuAndBeans(location) {
    const config = menuMap[location];
    if (!config) return;

    drinkList = config.drinks || [];
    coffeeDrinks = config.coffeeDrinks || [];

    beanSelect.value = '';
    beanOptions.innerHTML = '';
    suggestions.innerHTML = '';
    resetBeanSection();

    // ⭐ 여기 추가
    sizeSection.style.display = "none";
    sizeInput.value = "";
    document.querySelectorAll('.size-option').forEach((el) => {
        el.classList.remove('selected');
    });

    if (config.freeInput) {
        suggestions.innerHTML = "";
        beanSection.style.display = "none";
        sizeSection.style.display = "block";
        beanError.style.display = "none";
        beanSelect.value = "";
        drinkInput.placeholder = "스타벅스 메뉴를 자유롭게 입력해주세요";
        return;
    }

    drinkInput.placeholder = "음료 입력";

    (config.beans || []).forEach((bean) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'bean-option';
        button.textContent = bean;

        button.addEventListener('click', () => {
            beanSelect.value = bean;

            document.querySelectorAll('.bean-option').forEach((el) => {
                el.classList.remove('selected');
            });

            button.classList.add('selected');
            beanError.style.display = 'none';
        });

        beanOptions.appendChild(button);
    });
}

    document.querySelectorAll('input[name="location"]').forEach((radio) => {
        radio.addEventListener('change', (e) => {
            updateMenuAndBeans(e.target.value);

            drinkInput.value = '';
            suggestions.innerHTML = '';
            resetBeanSection();
        });
    });

    let currentFocus = -1;

    function updateBeanVisibilityByDrink(drinkText) {
        const config = getSelectedConfig();

        if (config?.freeInput) {
            resetBeanSection();
            return;
        }

        const cleaned = cleanDrinkName(drinkText);
        const normalized = normalize(cleaned);
        const isCoffee = coffeeDrinks.map(normalize).includes(normalized);

        if (isCoffee) {
            beanSection.style.display = 'block';
        } else {
            resetBeanSection();
        }
    }

    drinkInput.addEventListener('input', () => {
        const config = getSelectedConfig();

        if (config?.freeInput) {
            suggestions.innerHTML = '';
            resetBeanSection();
            return;
        }

        const raw = drinkInput.value;
        const cleaned = cleanDrinkName(raw);
        const normalized = normalize(cleaned);

        suggestions.innerHTML = '';
        currentFocus = -1;

        if (normalized.length > 0) {
            const matched = drinkList.filter((item) => normalize(item).includes(normalized));

            matched.slice(0, 5).forEach((match) => {
                const div = document.createElement('div');
                div.textContent = match;
                div.tabIndex = -1;
                div.classList.add('autocomplete-item');

                div.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    drinkInput.value = match;
                    suggestions.innerHTML = '';
                    updateBeanVisibilityByDrink(match);
                });

                suggestions.appendChild(div);
            });
        }

        updateBeanVisibilityByDrink(raw);
    });

    drinkInput.addEventListener('keydown', (e) => {
        const items = suggestions.querySelectorAll('div');

        if (e.key === 'ArrowDown') {
            currentFocus++;
            if (currentFocus >= items.length) currentFocus = 0;
            setActive(items);
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            currentFocus--;
            if (currentFocus < 0) currentFocus = items.length - 1;
            setActive(items);
            e.preventDefault();
        } else if (e.key === 'Enter') {
            if (currentFocus > -1 && items[currentFocus]) {
                const selected = items[currentFocus].textContent;
                drinkInput.value = selected;
                suggestions.innerHTML = '';
                updateBeanVisibilityByDrink(selected);
                e.preventDefault();
            }
        } else if (e.key === 'Escape') {
            suggestions.innerHTML = '';
        }
    });

    function setActive(items) {
        if (!items || items.length === 0) return;

        items.forEach((item) => item.classList.remove('active'));

        if (currentFocus >= 0 && currentFocus < items.length) {
            items[currentFocus].classList.add('active');
            items[currentFocus].scrollIntoView({ block: 'nearest' });
        }
    }

    document.addEventListener('click', (e) => {
        if (!suggestions.contains(e.target) && e.target !== drinkInput) {
            suggestions.innerHTML = '';
        }
    });

    function throttle(func, limit) {
        let lastCall = 0;

        return function (e) {
            e.preventDefault();

            const now = Date.now();

            if (now - lastCall >= limit) {
                lastCall = now;
                func.call(this, e);
            }
        };
    }

    const buttons = document.querySelectorAll('.temp-buttons button');

    const throttledSubmit = throttle(function (e) {
        const form = e.target.closest('form');
        const name = form.querySelector('input[name="name"]').value.trim();
        const drink = form.querySelector('input[name="drink"]').value.trim();
        const bean = form.querySelector('input[name="bean"]').value.trim();
        const size = form.querySelector('input[name="size"]').value.trim();
        const errorMsg = document.getElementById('error-msg');

        const selectedLocation = form.querySelector('input[name="location"]:checked')?.value;
        const config = menuMap[selectedLocation];

        if (!selectedLocation) {
            errorMsg.textContent = '카페를 선택해주세요.';
            errorMsg.style.display = 'block';
            return;
        }

        if (!name || !drink) {
            errorMsg.textContent = '이름과 음료를 모두 입력해주세요.';
            errorMsg.style.display = 'block';
            return;
        }

        if (config?.freeInput && !size) {
            errorMsg.textContent = '사이즈를 선택해주세요.';
            errorMsg.style.display = 'block';
            return;
        }

        errorMsg.style.display = 'none';

        const cleaned = cleanDrinkName(drink);
        const normalized = normalize(cleaned);
        const isCoffee = coffeeDrinks.map(normalize).includes(normalized);

        if (!config?.freeInput && isCoffee && !bean) {
            beanError.style.display = 'block';
            return;
        }

        beanError.style.display = 'none';

        const oldTemperatureInput = form.querySelector('input[name="temperature"]');
        if (oldTemperatureInput) {
            oldTemperatureInput.remove();
        }

        const temperature = e.target.value;
        const hidden = document.createElement('input');
        hidden.type = 'hidden';
        hidden.name = 'temperature';
        hidden.value = temperature;
        form.appendChild(hidden);

        form.submit();
    }, 1000);

    buttons.forEach((button) => button.addEventListener('click', throttledSubmit));

    document.querySelectorAll('.menu-img').forEach((img) => {
        img.addEventListener('click', () => {
            document.getElementById('modal-img').src = img.src;
            document.getElementById('img-modal').style.display = 'flex';
        });
    });

    document.getElementById('img-modal').addEventListener('click', () => {
        document.getElementById('img-modal').style.display = 'none';
    });

    window.addText = function (text) {
    if (!drinkInput.value.includes(text)) {
        drinkInput.value = (drinkInput.value + ' ' + text).trim();
    }

    drinkInput.dispatchEvent(new Event('input'));
    drinkInput.focus();
};

    function toggleNews() {
        const msg = document.getElementById('news-msg');
        if (!msg) return;

        msg.style.display = msg.style.display === 'none' ? 'block' : 'none';
    }

    document.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.dataset.size;

        sizeInput.value = size;

        document.querySelectorAll('.size-option').forEach(el => {
            el.classList.remove('selected');
        });

        btn.classList.add('selected');

        const errorMsg = document.getElementById('error-msg');
        errorMsg.style.display = 'none';
    });
});
});
const BASE_URL = 'http://localhost:2000/api';

async function runTests() {
    console.log('🧪 ПОЧАТОК ТЕСТУВАННЯ ВЕС API (ВАРІАНТ 3)...\n');

    try {
        // 1. Тест GET ALL
        console.log('--- Тест 1: GET /api/wind-plants ---');
        let res = await fetch(`${BASE_URL}/wind-plants`);
        console.log(await res.json());

        // 2. Тест PATCH Readings (Оновлено метод на PATCH)
        console.log('\n--- Тест 2: PATCH /api/wind-plants/1/readings ---');
        res = await fetch(`${BASE_URL}/wind-plants/1/readings`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ currentPower: 29000, windSpeed: 15.5, rotorSpeed: 17 })
        });
        const patchData = await res.json();
        console.log(patchData);

        // 3. Тест Аналітики
        console.log('\n--- Тест 3: GET /api/wind-plants/1/turbines ---');
        res = await fetch(`${BASE_URL}/wind-plants/1/turbines`);
        console.log(await res.json());

        console.log('\n✅ ТЕСТУВАННЯ ЗАВЕРШЕНО УСПІШНО!');
    } catch (err) {
        console.error('❌ ПОМИЛКА ТЕСТУВАННЯ:', err.message);
    }
}

runTests();
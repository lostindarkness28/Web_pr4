const express = require('express');
const path = require('path');
const app = express();
const PORT = 2000;

app.use(express.json());

// 1. Middleware для логування запитів (вимоги 4.4.4.3)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// База даних ВЕС (Варіант 3)
let windPlants = [
    {
        id: 1,
        name: "ВЕС Сиваська",
        turbineCount: 16,
        turbinePower: 3200,
        currentPower: 25000,
        windSpeed: 12.5,
        windDirection: 180,
        rotorSpeed: 15,
        availability: 98.5,
        status: "active"
    },
    {
        id: 2,
        name: "ВЕС Ботієвська",
        turbineCount: 65,
        turbinePower: 3000,
        currentPower: 120000,
        windSpeed: 14.2,
        windDirection: 210,
        rotorSpeed: 18,
        availability: 99.1,
        status: "active"
    }
];

// ГОЛОВНА СТОРІНКА
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. GET /api/wind-plants - Отримання всіх з фільтрацією (4.4.4.2)
app.get('/api/wind-plants', (req, res) => {
    let result = [...windPlants];
    const { name, minPower } = req.query;

    if (name) result = result.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    if (minPower) result = result.filter(p => p.currentPower >= parseFloat(minPower));

    res.json(result);
});

// 3. GET /api/wind-plants/:id - Деталі за ID
app.get('/api/wind-plants/:id', (req, res) => {
    const plant = windPlants.find(p => p.id === parseInt(req.params.id));
    if (!plant) return res.status(404).json({ error: "Об'єкт не знайдено", id: req.params.id });
    res.json(plant);
});

// 4. GET /api/wind-plants/:id/turbines - Розрахунок потужності
app.get('/api/wind-plants/:id/turbines', (req, res) => {
    const plant = windPlants.find(p => p.id === parseInt(req.params.id));
    if (!plant) return res.status(404).json({ error: "ВЕС не знайдено" });
    
    const maxCapacity = plant.turbineCount * plant.turbinePower;
    const loadFactor = ((plant.currentPower / maxCapacity) * 100).toFixed(2);
    
    res.json({
        name: plant.name,
        turbineCount: plant.turbineCount,
        maxPotentialPower: maxCapacity + " kW",
        currentUtilization: loadFactor + "%"
    });
});

// 5. POST /api/wind-plants - Створення з валідацією
app.post('/api/wind-plants', (req, res) => {
    const { name, turbineCount, turbinePower } = req.body;
    
    if (!name || !turbineCount || !turbinePower) {
        return res.status(400).json({ error: "Відсутні обов'язкові поля: name, turbineCount, turbinePower" });
    }

    const newPlant = {
        id: windPlants.length > 0 ? Math.max(...windPlants.map(p => p.id)) + 1 : 1,
        name,
        turbineCount: parseInt(turbineCount),
        turbinePower: parseInt(turbinePower),
        currentPower: 0,
        windSpeed: 0,
        windDirection: 0,
        rotorSpeed: 0,
        availability: 100,
        status: "new"
    };

    windPlants.push(newPlant);
    res.status(201).json(newPlant);
});

// 6. PATCH /api/wind-plants/:id/readings - Запис показів датчиків
app.patch('/api/wind-plants/:id/readings', (req, res) => {
    const index = windPlants.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "ВЕС не знайдено" });

    const { windSpeed, currentPower, rotorSpeed } = req.body;
    
    if (windSpeed) windPlants[index].windSpeed = parseFloat(windSpeed);
    if (currentPower) windPlants[index].currentPower = parseFloat(currentPower);
    if (rotorSpeed) windPlants[index].rotorSpeed = parseFloat(rotorSpeed);

    res.json({ message: "Дані датчиків оновлено", updatedPlant: windPlants[index] });
});

// 7. DELETE /api/wind-plants/:id - Видалення
app.delete('/api/wind-plants/:id', (req, res) => {
    const index = windPlants.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "ВЕС не знайдено" });

    const deleted = windPlants.splice(index, 1);
    res.json({ message: "Об'єкт видалено успішно", deletedObject: deleted[0] });
});
// Запуск сервера
app.listen(PORT, () => {
    console.log(`\n🚀 СЕРВЕР ВЕС (ВАРІАНТ 3) ЗАПУЩЕНО!`);
    console.log(`=============================================`);
    console.log(`🏠 Головна сторінка: http://localhost:${PORT}`);
    console.log(`\n📂 ДОСТУПНІ ЕНДПОІНТИ (API):`);
    console.log(`1. [GET]    /api/wind-plants          - Список всіх ВЕС`);
    console.log(`2. [GET]    /api/wind-plants/:id      - Дані однієї ВЕС`);
    console.log(`3. [GET]    /api/wind-plants/:id/turbines - Дані турбін`);
    console.log(`4. [GET]    /api/wind-plants/:id/wind-data - Метеодані`);
    console.log(`5. [POST]   /api/wind-plants/:id/readings - Запис датчиків`);
    console.log(`6. [PUT]    /api/wind-plants/:id      - Оновлення об'єкта`);
});
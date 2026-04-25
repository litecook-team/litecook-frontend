import i18n from '../i18n'; // Імпортуємо налаштування i18n

const DATA = {
    uk: {
        difficulty: { easy: 'Легкий', medium: 'Середній', hard: 'Важкий' },
        dish_types: {
            first: 'Перша страва', main: 'Основна страва', garnish: 'Гарнір', salad: 'Салат',
            snack: 'Закуска', dessert: 'Десерт', drink: 'Напій', sauce: 'Соус', soup: 'Суп',
            pasta: 'Паста', smoothie: 'Смузі', porridge: 'Каша', omelet: 'Омлет / Яєчна страва',
            flour: 'Борошняна страва', meat: 'М’ясна страва', fish: 'Рибна страва',
            seafood: 'Морепродукти', cold_snack: 'Холодна закуска', hot_snack: 'Гаряча закуска',
            festive: 'Святкова страва', aspic: 'Заливне', stew: 'Рагу / тушкована страва'
        },
        units: {
            g: 'г', kg: 'кг', ml: 'мл', l: 'л', tsp: 'ч. л.', tbsp: 'ст. л.', glass: 'скл.',
            pcs: 'шт.', pack: 'уп.', cm: 'см', taste: 'за смаком', garnish: 'для прикраси', frying: 'для смаження',
            can: ['банка', 'банки', 'банок'],
            leaf: ['лист', 'листа', 'листів'],
            clove: ['зубчик', 'зубчики', 'зубчиків'],
            pinch: ['дрібка', 'дрібки', 'дрібок'],
            bunch: ['пучок', 'пучки', 'пучків'],
            sprig: ['гілочка', 'гілочки', 'гілочок'],
            stalk: ['стебло', 'стебла', 'стебел'],
            drop: ['крапля', 'краплі', 'крапель'],
            slice: ['часточка', 'часточки', 'часточок']
        },
        cuisine: {
            eu: 'Європейська', mediterranean: 'Середземноморська', it: 'Італійська', mx: 'Мексиканська',
            intl: 'Міжнародна', ua: 'Українська', fr: 'Французька', us: 'Американська',
            cn: 'Китайська', jp: 'Японська', asian: 'Азійська', gb: 'Британська', author: 'Авторська', in: 'Індійська'
        },
        meal_times: { breakfast: 'Сніданок', lunch: 'Обід', dinner: 'Вечеря', snack: 'Перекус' },
        dietary_tags: {
            traditional: 'Традиційний', vegetarian: 'Вегетаріанський', vegan: 'Веганський',
            dietary: 'Дієтичний', gluten_free: 'Безглютеновий', lactose_free: 'Безлактозний',
            sugar_free: 'Без цукру', high_protein: 'Високобілковий', meat_diet: 'М’ясний', seafood_diet: 'Морський'
        },
        profile_dietary_tags: {
            traditional: 'Традиційний', vegetarian: 'Вегетаріанець', vegan: 'Веган',
            dietary: 'Дієта', gluten_free: 'Без глютену', lactose_free: 'Без лактози',
            sugar_free: 'Без цукру', high_protein: 'Високобілкове', meat_diet: 'М’ясоїд', seafood_diet: 'Пескетаріанець'
        }
    },
    en: {
        difficulty: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
        dish_types: {
            first: 'First Course', main: 'Main Course', garnish: 'Side Dish', salad: 'Salad',
            snack: 'Snack', dessert: 'Dessert', drink: 'Drink', sauce: 'Sauce', soup: 'Soup',
            pasta: 'Pasta', smoothie: 'Smoothie', porridge: 'Porridge', omelet: 'Omelet',
            flour: 'Flour Dish', meat: 'Meat Dish', fish: 'Fish Dish',
            seafood: 'Seafood', cold_snack: 'Cold Snack', hot_snack: 'Hot Snack',
            festive: 'Festive Dish', aspic: 'Aspic', stew: 'Stew'
        },
        units: {
            g: 'g', kg: 'kg', ml: 'ml', l: 'l', tsp: 'tsp', tbsp: 'tbsp', glass: 'glass',
            pcs: 'pcs', pack: 'pack', cm: 'cm', taste: 'to taste', garnish: 'for garnish', frying: 'for frying',
            can: ['can', 'cans', 'cans'],
            leaf: ['leaf', 'leaves', 'leaves'],
            clove: ['clove', 'cloves', 'cloves'],
            pinch: ['pinch', 'pinches', 'pinches'],
            bunch: ['bunch', 'bunches', 'bunches'],
            sprig: ['sprig', 'sprigs', 'sprigs'],
            stalk: ['stalk', 'stalks', 'stalks'],
            drop: ['drop', 'drops', 'drops'],
            slice: ['slice', 'slices', 'slices']
        },
        cuisine: {
            eu: 'European', mediterranean: 'Mediterranean', it: 'Italian', mx: 'Mexican',
            intl: 'International', ua: 'Ukrainian', fr: 'French', us: 'American',
            cn: 'Chinese', jp: 'Japanese', asian: 'Asian', gb: 'British', author: 'Author', in: 'Indian'
        },
        meal_times: { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' },
        dietary_tags: {
            traditional: 'Traditional', vegetarian: 'Vegetarian', vegan: 'Vegan',
            dietary: 'Dietary', gluten_free: 'Gluten Free', lactose_free: 'Lactose Free',
            sugar_free: 'Sugar Free', high_protein: 'High Protein', meat_diet: 'Meat', seafood_diet: 'Seafood'
        },
        profile_dietary_tags: {
            traditional: 'Traditional', vegetarian: 'Vegetarian', vegan: 'Vegan',
            dietary: 'Diet', gluten_free: 'Gluten Free', lactose_free: 'Lactose Free',
            sugar_free: 'Sugar Free', high_protein: 'High Protein', meat_diet: 'Meat Eater', seafood_diet: 'Pescatarian'
        }
    },
    pl: {
        difficulty: { easy: 'Łatwy', medium: 'Średni', hard: 'Trudny' },
        dish_types: {
            first: 'Pierwsze danie', main: 'Danie główne', garnish: 'Dodatek', salad: 'Sałatka',
            snack: 'Przekąska', dessert: 'Deser', drink: 'Napój', sauce: 'Sos', soup: 'Zupa',
            pasta: 'Makaron', smoothie: 'Smoothie', porridge: 'Kasza', omelet: 'Omlet',
            flour: 'Danie mączne', meat: 'Danie mięsne', fish: 'Danie rybne',
            seafood: 'Owoce morza', cold_snack: 'Zimna przekąska', hot_snack: 'Gorąca przekąska',
            festive: 'Danie świąteczne', aspic: 'Galareta', stew: 'Gulasz / potrawka'
        },
        units: {
            g: 'g', kg: 'kg', ml: 'ml', l: 'l', tsp: 'łyżeczka', tbsp: 'łyżka', glass: 'szkl.',
            pcs: 'szt.', pack: 'op.', cm: 'cm', taste: 'do smaku', garnish: 'do dekoracji', frying: 'do smażenia',
            can: ['puszka', 'puszki', 'puszek'],
            leaf: ['liść', 'liście', 'liści'],
            clove: ['ząbek', 'ząbki', 'ząbków'],
            pinch: ['szczypta', 'szczypty', 'szczypt'],
            bunch: ['pęczek', 'pęczki', 'pęczków'],
            sprig: ['gałązka', 'gałązki', 'gałązek'],
            stalk: ['łodyga', 'łodygi', 'łodyg'],
            drop: ['kropla', 'krople', 'kropli'],
            slice: ['plasterek', 'plasterki', 'plasterków']
        },
        cuisine: {
            eu: 'Europejska', mediterranean: 'Śródziemnomorska', it: 'Włoska', mx: 'Meksykańska',
            intl: 'Międzynarodowa', ua: 'Ukraińska', fr: 'Francuska', us: 'Amerykańska',
            cn: 'Chińska', jp: 'Japońska', asian: 'Azjatycka', gb: 'Brytyjska', author: 'Autorska', in: 'Indyjska'
        },
        meal_times: { breakfast: 'Śniadanie', lunch: 'Obiad', dinner: 'Kolacja', snack: 'Przekąska' },
        dietary_tags: {
            traditional: 'Tradycyjny', vegetarian: 'Wegetariański', vegan: 'Wegański',
            dietary: 'Dietetyczny', gluten_free: 'Bezглютеновий', lactose_free: 'Bez laktozy',
            sugar_free: 'Bez cukru', high_protein: 'Wysokobiałkowy', meat_diet: 'Mięsny', seafood_diet: 'Morski'
        },
        profile_dietary_tags: {
            traditional: 'Tradycyjny', vegetarian: 'Wegetarianin', vegan: 'Weganin',
            dietary: 'Dieta', gluten_free: 'Bez glutenu', lactose_free: 'Bez laktozy',
            sugar_free: 'Bez cukru', high_protein: 'Wysokobiałkowe', meat_diet: 'Mięsożerca', seafood_diet: 'Pescetarianin'
        }
    }
};

// МАГІЯ PROXY: Це дозволяє коду DICTIONARIES.difficulty працювати динамічно
export const DICTIONARIES = new Proxy({}, {
    get(target, prop) {
        // Визначаємо поточну мову
        const lang = i18n.language ? i18n.language.split('-')[0] : 'uk';
        // Повертаємо словник для цієї мови (або українську як резерв)
        return DATA[lang][prop] || DATA['uk'][prop];
    }
});
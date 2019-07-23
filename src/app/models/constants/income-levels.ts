export const INCOMELEVELS = {
    english: {
        '1': {
            KHM: 'very low (Income < 100 USD)',
            SYR: 'very low (Income < 30,000 SYP)',
        },
        '2': {
            KHM: 'low (100 USD < Income < 150 USD)',
            SYR: 'low (30,000 SYP < Income < 50,000 SYP)',
        },
        '3': {
            KHM: 'average (150 USD < Income < 250 USD)',
            SYR: 'average (50,000 SYP < Income < 90,000 SYP)',
        },
        '4': {
            KHM: 'high (250 USD < Income < 300 USD)',
            SYR: 'high (90,000 SYP < Income < 110,000 SYP)',
        },
        '5': {
            KHM: 'very high (300 USD < Income)',
            SYR: 'very high (110,000 SYP < Income)',
        },
    },

    arabic: {
        '1': {
            KHM: '(100 USD > ' + 'الإيرادات)' + 'منخفظ جدا' ,
            SYR: '(30,000 SYP > ' + 'الإيرادات)' + 'منخفظ جدا' ,
        },
        '2': {
            KHM: '(100 USD < ' + 'الإيرادات' + '< 150 USD)' + 'منخفض',
            SYR: '(30,000 USD < ' + 'الإيرادات' + '< 50,000 USD)' + 'منخفض',
        },
        '3': {
            KHM: '(150 USD < ' + 'الإيرادات' + '< 250 USD)' + 'معدل',
            SYR: '(50,000 USD < ' + 'الإيرادات' + '< 90,000 USD)' + 'معدل',
        },
        '4': {
            KHM: '(250 USD < ' + 'الإيرادات' + '< 300 USD)' + 'متوسط',
            SYR: '(90,000 USD < ' + 'الإيرادات' + '< 110,000 USD)' + 'متوسط',
        },
        '5': {
            KHM: '(300 USD < ' + 'الإيرادات)' + 'عالي جدا',
            SYR: '(110,000 USD < ' + 'الإيرادات)' + 'عالي جدا',
        },
    },

    french: {
        '1': {
            KHM: 'très bas (Revenus < 100 USD)',
            SYR: 'très bas (Revenus < 30,000 SYP)',
        },
        '2': {
            KHM: 'bas (100 USD < Revenus < 150 USD)',
            SYR: 'bas (30,000 SYP < Revenus < 50,000 SYP)',
        },
        '3': {
            KHM: 'moyen (150 USD < Revenus < 250 USD)',
            SYR: 'moyen (50,000 SYP < Revenus < 90,000 SYP)',
        },
        '4': {
            KHM: 'haut (250 USD < Revenus < 300 USD)',
            SYR: 'haut (90,000 SYP < Revenus < 110,000 SYP)',
        },
        '5': {
            KHM: 'très haut (300 USD < Revenus)',
            SYR: 'très haut (110,000 SYP < Revenus)',
        },
    },
};

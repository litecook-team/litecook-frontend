import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Обов'язково реєструємо шрифт із підтримкою кирилиці (української мови)
Font.register({
    family: 'Roboto',
    fonts: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 'light' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 'normal' },
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
    ]
});

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Roboto', backgroundColor: '#FFFFFF' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', borderBottomWidth: 3, borderBottomColor: '#6A907B', paddingBottom: 15, marginBottom: 25 },
    titleBlock: { flexDirection: 'column' },
    title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A', textTransform: 'uppercase' },
    subtitle: { fontSize: 12, color: '#6B7280', marginTop: 5 },
    logoBlock: { alignItems: 'flex-end' },
    logoText: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', letterSpacing: 2 },
    dateText: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },

    tableContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    row: { flexDirection: 'row', alignItems: 'center', width: '48%', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 8, marginBottom: 12 },

    checkbox: { width: 14, height: 14, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 3, marginRight: 10 },
    image: { width: 24, height: 24, borderRadius: 12, marginRight: 10, objectFit: 'cover' },
    dotPlaceholder: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', marginRight: 10, textAlign: 'center', fontSize: 14, color: '#D1D5DB', paddingTop: 2 },

    textContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemName: { fontSize: 11, fontWeight: 'normal', color: '#1F2937', flexShrink: 1, paddingRight: 5 },
    itemAmount: { fontSize: 11, fontWeight: 'bold', color: '#B47231' },

    footer: { marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 15, textAlign: 'center', fontSize: 9, color: '#9CA3AF' }
});

const ShoppingListPDF = ({ list, subtitleText, dateString }) => (
    <Document>
        <Page size="A4" style={styles.page}>

            <View style={styles.header}>
                <View style={styles.titleBlock}>
                    <Text style={styles.title}>Список продуктів</Text>
                    <Text style={styles.subtitle}>{subtitleText}</Text>
                </View>
                <View style={styles.logoBlock}>
                    <Text style={styles.logoText}>LITE COOK</Text>
                    <Text style={styles.dateText}>{dateString}</Text>
                </View>
            </View>

            <View style={styles.tableContainer}>
                {list.map((item, idx) => (
                    <View key={idx} style={styles.row}>
                        <View style={styles.checkbox}></View>

                        {item.image ? (
                            <Image src={item.image} style={styles.image} />
                        ) : (
                            <Text style={styles.dotPlaceholder}>•</Text>
                        )}

                        <View style={styles.textContainer}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemAmount}>{item.amount}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text>Згенеровано в додатку LITE cook. Нехай готування приносить радість!</Text>
            </View>

        </Page>
    </Document>
);

export default ShoppingListPDF;
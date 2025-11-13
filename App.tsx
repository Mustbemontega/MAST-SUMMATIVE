import React, { useEffect, useRef, useState } from 'react';
import {
Animated,
Alert,
Button,
FlatList,
SafeAreaView,
ScrollView,
StyleSheet,
Text,
TextInput,
TouchableOpacity,
View,
Platform
} from 'react-native';

type Course = 'Starter' | 'Main' | 'Dessert';

type MenuItem = {
id: string;
name: string;
desc: string;
course: Course;
price: number;
};

export default function App(): JSX.Element {
const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
const [screen, setScreen] = useState<'home' | 'add'>('home');

// add fields
const [name, setName] = useState('');
const [desc, setDesc] = useState('');
const [course, setCourse] = useState<Course>('Starter');
const [price, setPrice] = useState('');

// remove field
const [removeName, setRemoveName] = useState('');

// animation value
const fadeAnim = useRef(new Animated.Value(1)).current;

useEffect(() => {
fadeAnim.setValue(0.6);
Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
}, [menuItems.length, fadeAnim]);

const genId = () => `${Date.now()}_${Math.floor(Math.random() * 1000)}`;

const addItem = () => {
if (name.trim() === '' || desc.trim() === '' || price.trim() === '') {
Alert.alert('Validation', 'Please fill in all fields.');
return;
}
const parsed = parseFloat(price);
if (Number.isNaN(parsed) || parsed < 0) {
Alert.alert('Validation', 'Please enter a valid positive price.');
return;
}

const newItem: MenuItem = {
id: genId(),
name: name.trim(),
desc: desc.trim(),
course,
price: parsed,
};

setMenuItems(prev => [...prev, newItem]);
setName('');
setDesc('');
setPrice('');
Alert.alert('Success', 'Menu item added.');
};

const removeItem = () => {
if (removeName.trim() === '') {
Alert.alert('Error', 'Enter the dish name to remove.');
return;
}
const filtered = menuItems.filter(mi => mi.name.toLowerCase() !== removeName.trim().toLowerCase());
if (filtered.length === menuItems.length) {
Alert.alert('Not found', 'No menu item with that name.');
} else {
setMenuItems(filtered);
setRemoveName('');
Alert.alert('Removed', 'Item removed successfully.');
}
};

const getAveragePrices = (): { course: Course; avg: number }[] => {
const courses: Course[] = ['Starter', 'Main', 'Dessert'];
return courses.map(c => {
const items = menuItems.filter(i => i.course === c);
const avg = items.length ? items.reduce((s, i) => s + i.price, 0) / items.length : 0;
return { course: c, avg };
});
};

const sortByCourse = () => setMenuItems(prev => [...prev].sort((a, b) => a.course.localeCompare(b.course)));
const sortByPrice = () => setMenuItems(prev => [...prev].sort((a, b) => a.price - b.price));

const renderItem = ({ item }: { item: MenuItem }) => (
<Animated.View style={[styles.menuItem, { opacity: fadeAnim }]}>
<Text style={styles.itemTitle}>{item.name} ({item.course}) - R{item.price.toFixed(2)}</Text>
<Text style={styles.itemDesc}>{item.desc}</Text>
</Animated.View>
);

const CourseButton = ({ value }: { value: Course }) => (
<TouchableOpacity
style={[styles.courseButton, course === value ? styles.courseButtonActive : undefined]}
onPress={() => setCourse(value)}
>
<Text style={course === value ? styles.courseButtonTextActive : styles.courseButtonText}>{value}</Text>
</TouchableOpacity>
);

return (
<SafeAreaView style={styles.safe}>
<View style={styles.header}><Text style={styles.headerText}>Christoffel's Menu</Text></View>

{screen === 'home' ? (
<View style={styles.container}>
<Button title="Add Menu Item" onPress={() => setScreen('add')} />

<Text style={styles.info}>Total items: {menuItems.length}</Text>

<View style={styles.avgBox}>
<Text style={styles.avgTitle}>Average Prices:</Text>
{getAveragePrices().map(a => (
<Text key={a.course} style={styles.avgText}>{a.course}: R{a.avg.toFixed(2)}</Text>
))}
</View>

<View style={styles.sortRow}>
<TouchableOpacity style={styles.smallButton} onPress={sortByCourse}><Text style={styles.smallButtonText}>Sort by Course</Text></TouchableOpacity>
<TouchableOpacity style={styles.smallButton} onPress={sortByPrice}><Text style={styles.smallButtonText}>Sort by Price</Text></TouchableOpacity>
</View>

<View style={{ flex: 1, marginTop: 10 }}>
{menuItems.length === 0 ? (
<View style={styles.emptyBox}><Text style={styles.emptyText}>No menu items yet. Add some!</Text></View>
) : (
<FlatList data={menuItems} renderItem={renderItem} keyExtractor={i => i.id} />
)}
</View>
</View>
) : (
<ScrollView style={styles.container}>
<Text style={styles.subHeader}>Add Menu Item</Text>

<Text style={styles.label}>Dish Name</Text>
<TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Caesar Salad" />

<Text style={styles.label}>Description</Text>
<TextInput style={[styles.input, { height: 80 }]} value={desc} onChangeText={setDesc} placeholder="Short description" multiline />

<Text style={styles.label}>Course</Text>
<View style={styles.courseRow}>
<CourseButton value="Starter" />
<CourseButton value="Main" />
<CourseButton value="Dessert" />
</View>

<Text style={styles.label}>Price (R)</Text>
<TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="e.g., 49.99" keyboardType="numeric" />

<View style={{ marginTop: 10 }}>
<Button title="Add Item" onPress={addItem} />
</View>

<View style={{ marginTop: 20 }}>
<Text style={styles.label}>Remove Dish by Name</Text>
<TextInput style={styles.input} value={removeName} onChangeText={setRemoveName} placeholder="Exact dish name" />
<View style={{ marginTop: 8 }}>
<Button title="Remove Item" onPress={removeItem} />
</View>
</View>

<View style={{ marginTop: 24 }}>
<Button title="Back to Home" onPress={() => setScreen('home')} />
</View>
</ScrollView>
)}
</SafeAreaView>
);
}

const styles = StyleSheet.create({
safe: { flex: 1, backgroundColor: '#f0f2f5' },
header: { backgroundColor: '#2c3e50', padding: 18 },
headerText: { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center' },
container: { flex: 1, padding: 16 },
subHeader: { fontSize: 20, fontWeight: '700', color: '#2c3e50', marginBottom: 12, textAlign: 'center' },
label: { marginTop: 8, fontWeight: '600', color: '#34495e' },
input: { backgroundColor: '#fff', borderColor: '#ccc', borderWidth: 1, borderRadius: 6, paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 12 : 8, marginTop: 6 },
courseRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
courseButton: { flex: 1, paddingVertical: 10, marginHorizontal: 4, borderRadius: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', alignItems: 'center' },
courseButtonActive: { backgroundColor: '#3498db', borderColor: '#2980b9' },
courseButtonText: { color: '#34495e', fontWeight: '700' },
courseButtonTextActive: { color: '#fff', fontWeight: '700' },
info: { marginTop: 12, fontWeight: '700', color: '#34495e' },
avgBox: { marginTop: 8, backgroundColor: '#fff', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#e1e4e8' },
avgTitle: { fontWeight: '700', marginBottom: 6 },
avgText: { color: '#333', marginTop: 2 },
sortRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
smallButton: { backgroundColor: '#3498db', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, width: '48%', alignItems: 'center' },
smallButtonText: { color: '#fff', fontWeight: '700' },
menuItem: { backgroundColor: '#ecf0f1', padding: 12, marginVertical: 6, marginHorizontal: 2, borderLeftWidth: 6, borderLeftColor: '#3498db', borderRadius: 6 },
itemTitle: { fontWeight: '700', color: '#2c3e50' },
itemDesc: { marginTop: 4, color: '#333' },
emptyBox: { marginTop: 30, alignItems: 'center' },
emptyText: { color: '#7f8c8d' },
});
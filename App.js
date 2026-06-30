import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Modal, 
  Linking, 
  Dimensions,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Animated,
  Easing,
  Alert,
  FlatList,
  BackHandler,
  ImageBackground,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const STATUSBAR_PADDING = Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15;
const OVERLAP_SAFETY_MARGIN = Platform.OS === 'ios' ? 32 : 26; 

// ==========================================
// 1. ADVANCED STATE ENGINE & CONTEXT LINK
// ==========================================
const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [currentScreen, setCurrentScreen] = useState('Splash'); 
  const [cart, setCart] = useState([]);
  const [activeRestaurant, setActiveRestaurant] = useState(null);
  
  // Auth Matrix States
  const [currentUser, setCurrentUser] = useState(null); 
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState(''); 
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 

  // Administrative Core Variables
  const [adminWhatsAppNumber, setAdminWhatsAppNumber] = useState("917292971282");
  const [upiId, setUpiId] = useState("merchant@upi");
  const [perKmCharge, setPerKmCharge] = useState(15);
  const [packingChargePerRes, setPackingChargePerRes] = useState(30);
  const supportEmail = "Foodfiyo99@gmail.com";
  
  // Temporary State Holds for Inputs
  const [resName, setResName] = useState('');
  const [resType, setResType] = useState('');
  const [resTags, setResTags] = useState('');
  
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [dishCategory, setDishCategory] = useState('');
  const [dishIsVeg, setDishIsVeg] = useState(true);
  const [selectedResIdForDish, setSelectedResIdForDish] = useState('');

  // Comprehensive Customer Coordinates Model
  const [savedAddress, setSavedAddress] = useState({
    name: '', phone: '', flatNo: '', area: '', landmark: '', city: '', pincode: ''
  });

  // Strict Baseline Production Clusters 
  const defaultRestaurants = [
    { 
      id: '1', 
      name: 'AASHIRWAD Gourmet', 
      rating: '4.8', 
      type: 'Traditional Indian', 
      tags: 'North Indian • Premium Dining • Thali', 
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      menu: [
        { id: 'm1', name: 'Veg Butter Naan', price: 60, category: 'Breads', isVeg: true }, 
        { id: 'm2', name: 'Dal Makhani', price: 180, category: 'Main Course', isVeg: true },
        { id: 'm3', name: 'Shahi Paneer Special', price: 220, category: 'Main Course', isVeg: true },
        { id: 'm4', name: 'Jeera Rice Full', price: 120, category: 'Rice Items', isVeg: true }
      ] 
    },
    { 
      id: '2', 
      name: 'Pizza Planet', 
      rating: '4.7', 
      type: 'Italian Gourmet', 
      tags: 'Pizza • Pasta • Fast Food • Desserts', 
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      menu: [
        { id: 'm5', name: 'Farmhouse Pizza (Medium)', price: 249, category: 'Pizza', isVeg: true }, 
        { id: 'm6', name: 'Pasta Alfredo', price: 229, category: 'Pasta', isVeg: true },
        { id: 'm7', name: 'Garlic Bread Stuffed', price: 149, category: 'Sides', isVeg: true },
        { id: 'm8', name: 'Chocolate Lava Cake', price: 99, category: 'Desserts', isVeg: true }
      ] 
    },
    { 
      id: '3', 
      name: 'Radha Krishna hotel', 
      rating: '5.0', 
      type: 'Restaurant and family restaurant', 
      tags: 'Pure Veg • Indian Thali • South Indian', 
      image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80',
      menu: [
        { id: 'm9', name: 'Special Veg Thali', price: 199, category: 'Thali', isVeg: true },
        { id: 'm14', name: 'Masala Dosa Crispy', price: 110, category: 'South Indian', isVeg: true },
        { id: 'm15', name: 'Idli Sambar Plate', price: 70, category: 'South Indian', isVeg: true }
      ] 
    },
    { 
      id: '4', 
      name: 'Spice Route', 
      rating: '5.0', 
      type: 'North Indian', 
      tags: 'Spicy • Tandoor Hub • Mughlai', 
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      menu: [
        { id: 'm10', name: 'Kadhai Paneer', price: 240, category: 'Main Course', isVeg: true },
        { id: 'm11', name: 'Tandoori Roti Plain', price: 15, category: 'Breads', isVeg: true },
        { id: 'm12', name: 'Paneer Tikka Dry', price: 210, category: 'Starters', isVeg: true },
        { id: 'm13', name: 'Mix Veg Gravy', price: 170, category: 'Main Course', isVeg: true }
      ] 
    }
  ];

  const [restaurants, setRestaurants] = useState(defaultRestaurants);

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('SAVED_RESTAURANTS');
        if (savedData) setRestaurants(JSON.parse(savedData));
        
        const savedPhone = await AsyncStorage.getItem('SAVED_PHONE');
        if (savedPhone) setAdminWhatsAppNumber(savedPhone);
        
        const savedUpi = await AsyncStorage.getItem('SAVED_UPI');
        if (savedUpi) setUpiId(savedUpi);
        
        const savedKm = await AsyncStorage.getItem('SAVED_KM');
        if (savedKm) setPerKmCharge(Number(savedKm));
        
        const savedPack = await AsyncStorage.getItem('SAVED_PACK');
        if (savedPack) setPackingChargePerRes(Number(savedPack));

        const activeUserSession = await AsyncStorage.getItem('LOGGED_IN_USER_SESSION');
        if (activeUserSession) {
          setCurrentUser(activeUserSession);
          const localAddress = await AsyncStorage.getItem(`ADDRESS_${activeUserSession}`);
          if (localAddress) setSavedAddress(JSON.parse(localAddress));
        }
      } catch (e) {
        console.log("Configurations parsing data stream fault log:", e);
      }
    };
    loadSavedData();
  }, []);

  const savePermanentAddress = async (addressObject) => {
    setSavedAddress(addressObject);
    try { 
      if (currentUser) {
        await AsyncStorage.setItem(`ADDRESS_${currentUser}`, JSON.stringify(addressObject)); 
      }
    } catch (e) {}
  };

  // Auth Operations Handler Matrix
  const handleAuthAction = async () => {
    if (isSignupMode && !authName.trim()) {
      Alert.alert("Input Error", "Please provide your Full Name to complete registration node.");
      return;
    }
    if (!authEmail.trim() || !authPassword.trim()) {
      Alert.alert("Input Error", "Please provide a valid Email and Password node.");
      return;
    }
    try {
      const storedUsersRaw = await AsyncStorage.getItem('FOODIFYO_USER_REGISTRY');
      let registeredUsers = storedUsersRaw ? JSON.parse(storedUsersRaw) : {};

      if (isSignupMode) {
        if (registeredUsers[authEmail.toLowerCase()]) {
          Alert.alert("Error", "Account already exists under this Email identifier node.");
          return;
        }
        // Save password and associated profile name properties
        registeredUsers[authEmail.toLowerCase()] = { password: authPassword, name: authName.trim() };
        await AsyncStorage.setItem('FOODIFYO_USER_REGISTRY', JSON.stringify(registeredUsers));
        await AsyncStorage.setItem('LOGGED_IN_USER_SESSION', authEmail.toLowerCase());
        setCurrentUser(authEmail.toLowerCase());
        
        // Populate address name node dynamically from signup matrix data
        setSavedAddress(prev => {
          const updated = { ...prev, name: authName.trim() };
          AsyncStorage.setItem(`ADDRESS_${authEmail.toLowerCase()}`, JSON.stringify(updated));
          return updated;
        });

        setAuthEmail(''); setAuthPassword(''); setAuthName('');
        setCurrentScreen('Home');
      } else {
        const userNode = registeredUsers[authEmail.toLowerCase()];
        const correctPassword = userNode && typeof userNode === 'object' ? userNode.password : userNode;
        
        if (correctPassword && correctPassword === authPassword) {
          await AsyncStorage.setItem('LOGGED_IN_USER_SESSION', authEmail.toLowerCase());
          setCurrentUser(authEmail.toLowerCase());
          
          const localAddress = await AsyncStorage.getItem(`ADDRESS_${authEmail.toLowerCase()}`);
          if (localAddress) {
            setSavedAddress(JSON.parse(localAddress));
          } else {
            const mappedName = (userNode && typeof userNode === 'object') ? userNode.name : '';
            setSavedAddress({ name: mappedName, phone: '', flatNo: '', area: '', landmark: '', city: '', pincode: '' });
          }

          setAuthEmail(''); setAuthPassword(''); setAuthName('');
          setCurrentScreen('Home');
        } else {
          Alert.alert("Access Denied", "Invalid Email or Password verification vector.");
        }
      }
    } catch (e) {
      Alert.alert("System Fault", "Authentication pipeline failure.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('LOGGED_IN_USER_SESSION');
      setCurrentUser(null);
      setSavedAddress({ name: '', phone: '', flatNo: '', area: '', landmark: '', city: '', pincode: '' });
      clearCart();
      setCurrentScreen('Auth');
    } catch (e) {}
  };

  const addToCart = (item, resName, resId) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1, restaurantName: resName, restaurantId: resId }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0));
  };

  const clearCart = () => setCart([]);
  const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const getUniqueRestaurantsCount = () => new Set(cart.map(item => item.restaurantId)).size;
  const getPackingCharge = () => getUniqueRestaurantsCount() * packingChargePerRes;
  const getGrandTotal = () => getSubtotal() + getPackingCharge();

  const addRestaurant = async (name, type, tags) => {
    const newRes = { 
      id: String(Date.now()), 
      name, 
      rating: '5.0', 
      type, 
      tags, 
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
      menu: [] 
    };
    const updatedList = [...restaurants, newRes];
    setRestaurants(updatedList);
    try { await AsyncStorage.setItem('SAVED_RESTAURANTS', JSON.stringify(updatedList)); } catch (e) {}
  };

  const removeRestaurant = async (resId) => {
    const updatedList = restaurants.filter(res => res.id !== resId);
    setRestaurants(updatedList);
    try { await AsyncStorage.setItem('SAVED_RESTAURANTS', JSON.stringify(updatedList)); } catch (e) {}
  };

  const addDishToRestaurant = async (resId, name, price, category, isVeg) => {
    const updatedList = restaurants.map(res => {
      if (res.id === resId) {
        return { ...res, menu: [...res.menu, { id: `m_${Date.now()}`, name, price: Number(price), category, isVeg }] };
      }
      return res;
    });
    setRestaurants(updatedList);
    try { await AsyncStorage.setItem('SAVED_RESTAURANTS', JSON.stringify(updatedList)); } catch (e) {}
  };

  const removeDishFromRestaurant = async (resId, dishId) => {
    const updatedList = restaurants.map(res => {
      if (res.id === resId) return { ...res, menu: res.menu.filter(dish => dish.id !== dishId) };
      return res;
    });
    setRestaurants(updatedList);
    try { await AsyncStorage.setItem('SAVED_RESTAURANTS', JSON.stringify(updatedList)); } catch (e) {}
  };

  const updateSettings = async (phone, upi, km, pack) => {
    setAdminWhatsAppNumber(phone); setUpiId(upi); setPerKmCharge(Number(km)); setPackingChargePerRes(Number(pack));
    try {
      await AsyncStorage.setItem('SAVED_PHONE', phone); await AsyncStorage.setItem('SAVED_UPI', upi);
      await AsyncStorage.setItem('SAVED_KM', String(km)); await AsyncStorage.setItem('SAVED_PACK', String(pack));
    } catch (e) {}
  };

  const openEmailSupport = () => {
    const url = `mailto:${supportEmail}?subject=Foodfiyo%20App%20Support`;
    Linking.openURL(url).catch(() => alert("Email Support Trace Node: " + supportEmail));
  };

  const sendWhatsAppOrder = (customerDetails, instructionsState, paymentMode) => {
    const groupedCart = cart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) acc[item.restaurantId] = { name: item.restaurantName, items: [] };
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {});

    let msg = `NEW DELIVERY ORDER\n━━━━━━━━━━━━━━━\n📦 ORDER DETAILS\n━━━━━━━━━━━━━━━\n👤 Customer: ${customerDetails.name}\n📞 Phone: ${customerDetails.phone}\n📍 Address: ${customerDetails.flatNo}, ${customerDetails.area}, ${customerDetails.city} - ${customerDetails.pincode}\n👤 ID: ${currentUser}\n━━━━━━━━━━━━━━━\n`;
    Object.keys(groupedCart).forEach((resId, index) => {
      const group = groupedCart[resId];
      msg += `🍽️ Restaurant ${index + 1}: ${group.name}\n🛒 Items:\n`;
      group.items.forEach(i => msg += `* ${i.name} ×${i.qty} — ₹${i.price * i.qty}\n`);
      if (instructionsState[resId]?.trim()) msg += `➕ Instructions: ${instructionsState[resId]}\n`;
      msg += `💰 Subtotal: ₹${group.items.reduce((sum, i) => sum + (i.price * i.qty), 0)}\n━━━━━━━━━━━━━━━\n`;
    });
    msg += `💳 PAYMENT DETAILS\n━━━━━━━━━━━━━━━\n🧾 Item Total: ₹${getSubtotal()}\n📦 Packing Charge: ₹${getPackingCharge()}\n🛵 Delivery Charge: Added live by agent\n💰 Payment Method: ${paymentMode}\n━━━━━━━━━━━━━━━\n❌ Once placed, order CANNOT be cancelled.\n✅ ORDER CONFIRMED`;

    const url = `whatsapp://send?phone=${adminWhatsAppNumber}&text=${encodeURIComponent(msg)}`;
    Linking.canOpenURL(url).then(supp => {
      if (supp) Linking.openURL(url);
      else Linking.openURL(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(msg)}`);
    });
  };

  return (
    <OrderContext.Provider value={{ 
      currentScreen, setCurrentScreen, cart, addToCart, updateQty, clearCart, getSubtotal, getPackingCharge, getGrandTotal, sendWhatsAppOrder, activeRestaurant, setActiveRestaurant,
      restaurants, addRestaurant, removeRestaurant, addDishToRestaurant, removeDishFromRestaurant, adminWhatsAppNumber, upiId, perKmCharge, packingChargePerRes, updateSettings, openEmailSupport, savedAddress, savePermanentAddress,
      resName, setResName, resType, setResType, resTags, setResTags,
      dishName, setDishName, dishPrice, setDishPrice, dishCategory, setDishCategory, dishIsVeg, setDishIsVeg, selectedResIdForDish, setSelectedResIdForDish,
      currentUser, authEmail, setAuthEmail, authPassword, setAuthPassword, authName, setAuthName, isSignupMode, setIsSignupMode, isPasswordVisible, setIsPasswordVisible, handleAuthAction, handleLogout
    }}>
      {children}
    </OrderContext.Provider>
  );
}

const useOrder = () => useContext(OrderContext);

// ==========================================
// 2. COMPREHENSIVE FLOATING BOTTOM SHEET ENGINE
// ==========================================
function GlobalCartStrip({ onCheckoutTrigger }) {
  const { cart, getGrandTotal, clearCart } = useOrder();
  if (cart.length === 0) return null;

  return (
    <View style={styles.globalCartBarFrame}>
      <View style={styles.globalCartLeftBlock}>
        <Text style={styles.globalCartMainText}>{cart.reduce((sum, i) => sum + i.qty, 0)} Item Added</Text>
        <Text style={styles.globalCartSubText}>From {new Set(cart.map(i => i.restaurantId)).size} Kitchen Hubs</Text>
      </View>
      <View style={styles.globalCartRightBlock}>
        <Text style={styles.globalCartPrice}>₹{getGrandTotal()}</Text>
        <TouchableOpacity style={styles.globalCartCtaBtn} onPress={onCheckoutTrigger}>
          <Text style={styles.globalCartCtaText}>Next →</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.globalCartExitCross} onPress={clearCart}>
          <Text style={styles.globalCartExitText}>✕ Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==========================================
// 3. ORIGINAL SPLASH SCREEN ENGINE
// ==========================================
function SplashScreen() {
  const { setCurrentScreen, currentUser } = useOrder();
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 1500,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen('Terms');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentUser]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[styles.splashNewContainer, { opacity: opacityAnim }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Animated.View style={[styles.fallbackLogoContainer, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View style={[styles.splashGraphicRingOuter, { transform: [{ rotate: spin }] }]}>
          <View style={styles.splashGraphicRingInner}>
            <Text style={styles.splashIconEmblem}>🍔</Text>
          </View>
        </Animated.View>
        <Text style={styles.foodfiyoBrandText}>FOODIFYO</Text>
        <Text style={styles.splashTaglineText}>Premium Multi-Kitchen Terminal</Text>
        <View style={styles.splashProgressBarTrack}>
          <Animated.View style={styles.splashProgressBarFiller} />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ==========================================
// 3.2 DYNAMIC TERMS & CONDITIONS MODULE 
// ==========================================
function TermsAndConditionsScreen() {
  const { setCurrentScreen, currentUser } = useOrder();
  const [isChecked, setIsChecked] = useState(false);

  const handleTermsAcceptance = () => {
    if (!isChecked) return;
    if (currentUser) setCurrentScreen('Home');
    else setCurrentScreen('Auth');
  };

  return (
    <SafeAreaView style={styles.termsWrapperMain}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCFC" />
      <View style={styles.termsHeaderBlock}>
        <Text style={styles.termsHeadingText}>FOODIFYO – Terms & Conditions</Text>
        <View style={styles.termsDecorativeBar} />
      </View>

      <ScrollView style={styles.termsScrollingContent} showsVerticalScrollIndicator={true}>
        <Text style={styles.termsSectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.termsBodyText}>By accessing or using the FOODIFYO application, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use the application.</Text>

        <Text style={styles.termsSectionTitle}>2. User Account</Text>
        <Text style={styles.termsBodyText}>• Users must provide accurate, complete, and up-to-date information during registration.{"\n"}• Users are responsible for maintaining the confidentiality of their account credentials.{"\n"}• Users are responsible for all activities that occur under their account.</Text>

        <Text style={styles.termsSectionTitle}>3. Orders and Services</Text>
        <Text style={styles.termsBodyText}>• All orders placed through FOODIFYO are subject to restaurant availability and acceptance.{"\n"}• Restaurants may refuse or cancel orders due to unavailability, operational issues, or other valid reasons.{"\n"}• Users are responsible for providing correct delivery addresses and contact details.</Text>

        <Text style={styles.termsSectionTitle}>4. Pricing and Payments</Text>
        <Text style={styles.termsBodyText}>• Prices displayed on the application may change without prior notice.{"\n"}• Applicable taxes, delivery fees, platform fees, and other charges will be displayed during checkout.{"\n"}• Payment must be successfully completed before an order is confirmed.</Text>

        <Text style={styles.termsSectionTitle}>5. Order Cancellation and Refunds</Text>
        <Text style={styles.termsBodyText}>• Cancellation requests are subject to the restaurant's policies and the order status.{"\n"}• Orders that have already been prepared, processed, or dispatched may not be eligible for cancellation or refund.{"\n"}• Refunds, partial refunds, or replacements may be provided in cases of incorrect, damaged, or incomplete orders, subject to review.{"\n"}• Approved refunds may take several business days to be processed.</Text>

        <Text style={styles.termsSectionTitle}>6. Delivery</Text>
        <Text style={styles.termsBodyText}>• Delivery times are estimated and are not guaranteed.{"\n"}• Delays may occur due to weather conditions, traffic, restaurant preparation time, technical issues, or other unforeseen circumstances.{"\n"}• Users must be available at the delivery location to receive their orders.</Text>

        <Text style={styles.termsSectionTitle}>7. User Conduct</Text>
        <Text style={styles.termsBodyText}>Users agree not to:{"\n"}• Use the application for any unlawful purpose.{"\n"}• Place fraudulent or misleading orders.{"\n"}• Abuse, threaten, harass, or mistreat delivery personnel, restaurant staff, or other users.{"\n"}• Attempt to interfere with the operation or security of the application.</Text>

        <Text style={styles.termsSectionTitle}>8. Restaurant Responsibility</Text>
        <Text style={styles.termsBodyText}>FOODIFYO acts as a technology platform connecting users with restaurants. Restaurants are solely responsible for food preparation, quality, ingredients, hygiene, packaging, and compliance with applicable food safety regulations.</Text>

        <Text style={styles.termsSectionTitle}>9. Allergies and Dietary Restrictions</Text>
        <Text style={styles.termsBodyText}>Users are responsible for reviewing food descriptions and ingredients before placing orders. FOODIFYO shall not be liable for allergic reactions or dietary issues arising from food consumption.</Text>

        <Text style={styles.termsSectionTitle}>10. Privacy and Data Protection</Text>
        <Text style={styles.termsBodyText}>• FOODIFYO collects and stores user information necessary for providing its services.{"\n"}• User data is used only for account management, order processing, customer support, and improving the user experience.{"\n"}• FOODIFYO does not sell, rent, or share users' personal information with third parties for marketing purposes.{"\n"}• User information is protected using reasonable security measures.{"\n"}• By using the application, users consent to the collection and use of their information as described in these Terms.</Text>

        <Text style={styles.termsSectionTitle}>11. Limitation of Liability</Text>
        <Text style={styles.termsBodyText}>FOODIFYO shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of the application or services provided through the platform.</Text>

        <Text style={styles.termsSectionTitle}>12. Account Suspension or Termination</Text>
        <Text style={styles.termsBodyText}>FOODIFYO reserves the right to suspend or terminate any user account without prior notice if:{"\n"}• False information is provided.{"\n"}• Fraudulent or suspicious activities are detected.{"\n"}• These Terms & Conditions are violated.{"\n"}• Any activity is deemed harmful to the platform, restaurants, delivery personnel, or other users.</Text>

        <Text style={styles.termsSectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.termsBodyText}>FOODIFYO reserves the right to modify these Terms & Conditions at any time. Updated terms will become effective upon publication within the application or on the official website.</Text>

        <Text style={styles.termsSectionTitle}>14. Governing Law</Text>
        <Text style={styles.termsBodyText}>These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of the appropriate courts in India.</Text>

        <Text style={styles.termsSectionTitle}>15. Contact Information</Text>
        <Text style={styles.termsBodyText}>For questions, complaints, or support, please contact:{"\n\n"}<Text style={{fontWeight: 'bold'}}>FOODIFYO Support Team</Text>{"\n"}Email: Foodifyo99@gmail.com{"\n"}Phone: +91 72929 71282</Text>
        
        <Text style={styles.termsFooterStatement}>By creating an account or using FOODIFYO, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.</Text>
        <View style={{ height: 30 }} />
      </ScrollView>

      <View style={styles.termsBottomStickyBlock}>
        <TouchableOpacity 
          style={styles.termsCheckboxRow} 
          activeOpacity={0.8}
          onPress={() => setIsChecked(!isChecked)}
        >
          <View style={[styles.termsCustomCheckboxBox, isChecked && styles.termsCheckboxCheckedState]}>
            {isChecked && <Text style={styles.termsCheckboxCheckmarkEmblem}>✓</Text>}
          </View>
          <Text style={styles.termsCheckboxLabelText}>I agree to the Terms & Conditions of FOODIFYO</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.termsActionContinueBtn, !isChecked && styles.termsActionContinueBtnDisabled]} 
          disabled={!isChecked}
          onPress={handleTermsAcceptance}
        >
          <Text style={styles.termsActionContinueBtnText}>CONTINUE ➔</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 3.5 BRAND NEW CUSTOMER GATEWAY SIGNUP/LOGIN TERMINAL
// ==========================================
function AuthGateScreen() {
  const { 
    authEmail, setAuthEmail, authPassword, setAuthPassword, authName, setAuthName,
    isSignupMode, setIsSignupMode, isPasswordVisible, setIsPasswordVisible, handleAuthAction 
  } = useOrder();

  return (
    <SafeAreaView style={styles.authWrapperMain}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBFCFC" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.authCardWidgetFrame}>
          
          <View style={styles.authBrandingHeaderBlock}>
            <Text style={styles.authLogoGraphic}>🚀</Text>
            <Text style={styles.authWelcomeHeadingText}>Welcome to Foodifyo</Text>
            <Text style={styles.authDescriptorSubText}>
              {isSignupMode ? 'Create your permanent terminal profile matrix' : 'Log in to sync your personal culinary hubs'}
            </Text>
          </View>

          <View style={{ marginTop: 15 }}>
            {isSignupMode && (
              <View>
                <Text style={styles.adminFieldLabel}>Customer Full Name</Text>
                <TextInput 
                  style={styles.checkoutInputCompact} 
                  placeholder="Enter your name" 
                  placeholderTextColor="#BDC3C7"
                  value={authName} 
                  onChangeText={setAuthName} 
                />
              </View>
            )}

            <Text style={styles.adminFieldLabel}>Terminal Email Address</Text>
            <TextInput 
              style={styles.checkoutInputCompact} 
              placeholder="name@domain.com" 
              placeholderTextColor="#BDC3C7"
              keyboardType="email-address"
              autoCapitalize="none"
              value={authEmail} 
              onChangeText={setAuthEmail} 
            />

            <Text style={styles.adminFieldLabel}>Secure Access Password</Text>
            <View style={styles.authPasswordInputContainerRow}>
              <TextInput 
                style={styles.authPasswordInputFieldFlex} 
                placeholder="••••••••" 
                placeholderTextColor="#BDC3C7"
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                value={authPassword} 
                onChangeText={setAuthPassword} 
              />
              <TouchableOpacity 
                style={styles.authEyeButtonTogglePill} 
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                activeOpacity={0.7}
              >
                <Text style={styles.authEyeIconLabelText}>{isPasswordVisible ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.authPrimaryActionBtn} onPress={handleAuthAction}>
              <Text style={styles.authPrimaryBtnTextLabel}>
                {isSignupMode ? 'INITIALIZE SIGN UP ➔' : 'SECURE LOG IN ➔'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.authToggleModeButtonPill} onPress={() => { setIsSignupMode(!isSignupMode); setIsPasswordVisible(false); }}>
              <Text style={styles.authToggleModeLinkText}>
                {isSignupMode ? 'Already registered? Log In Protocol' : "Don't have an account? Sign Up Core"}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// 4. HOME DASHBOARD MATRIX ENGINE (ORIGINAL)
// ==========================================
function HomeDashboard({ onOpenCheckout }) {
  const { setCurrentScreen, setActiveRestaurant, restaurants, perKmCharge, savedAddress, savePermanentAddress, openEmailSupport, currentUser, handleLogout } = useOrder();
  const [pinModalVisible, setPinModalVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [homeSearch, setHomeSearch] = useState('');
  const [secretTapCount, setSecretTapCount] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [addrForm, setAddrForm] = useState({ name: '', phone: '', flatNo: '', area: '', landmark: '', city: '', pincode: '' });

  useEffect(() => { if (savedAddress) setAddrForm(savedAddress); }, [savedAddress]);

  const handleSecretTap = () => {
    const nextCount = secretTapCount + 1;
    if (nextCount >= 7) { setSecretTapCount(0); setPinModalVisible(true); } 
    else { setSecretTapCount(nextCount); setTimeout(() => setSecretTapCount(0), 3000); }
  };

  const filteredRestaurants = restaurants.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(homeSearch.toLowerCase()) || res.type.toLowerCase().includes(homeSearch.toLowerCase()) || res.tags.toLowerCase().includes(homeSearch.toLowerCase());
    if (activeCategoryFilter === 'All') return matchesSearch;
    if (activeCategoryFilter === 'Pure Veg') return matchesSearch && res.tags.toLowerCase().includes('pure veg');
    if (activeCategoryFilter === 'Premium') return matchesSearch && res.tags.toLowerCase().includes('premium');
    if (activeCategoryFilter === 'Fast Food') return matchesSearch && res.tags.toLowerCase().includes('fast food');
    return matchesSearch;
  });

  const filterCategories = ['All', 'Pure Veg', 'Premium', 'Fast Food'];

  return (
    <View style={styles.safeAreaAdaptiveContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      
      <ScrollView style={styles.subScreenContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.homeHeader}>
          <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={handleSecretTap} activeOpacity={1}>
              <Text style={styles.foodfiyoBrandText}>FOODIFYO 🚀</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center' }} onPress={() => setAddressModalVisible(true)}>
              <Text style={styles.homeAddressSubtext} numberOfLines={1}>
                {savedAddress?.flatNo ? `📍 ${savedAddress.flatNo}, ${savedAddress.area}, ${savedAddress.city}` : '📍 Setup Delivery Coordinate Destination'}
              </Text>
              <Text style={{fontSize: 10, color: '#16A085', marginLeft: 4}}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity style={styles.supportButtonPill} onPress={openEmailSupport}>
              <Text style={styles.supportButtonText}>📩 Support</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.supportButtonPill, { backgroundColor: '#FADBD8', borderColor: '#F5B7B1' }]} onPress={handleLogout}>
              <Text style={[styles.supportButtonText, { color: '#C0392B' }]}>🚪 Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ marginBottom: 14, backgroundColor: '#EAEDED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }}>
          <Text style={{ fontSize: 11, color: '#2C3E50', fontWeight: '800' }}>👤 Terminal Session Active: <Text style={{ fontWeight: '400', color: '#566573' }}>{currentUser}</Text></Text>
        </View>

        <View style={styles.searchBarWrapper}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput style={styles.searchBarInput} placeholder="Search cuisines, restaurant hubs..." placeholderTextColor="#7E7E7E" value={homeSearch} onChangeText={setHomeSearch} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.promoBannerContainer}>
          <View style={[styles.promoCard, { backgroundColor: '#E2F0D9' }]}>
            <Text style={styles.promoTitle}>Multi-Kitchen Order Enabled</Text>
            <Text style={styles.promoSub}>Add items from multiple hubs instantly!</Text>
            <Text style={styles.promoBadge}>FOODIFYO SAFE</Text>
          </View>
          <View style={[styles.promoCard, { backgroundColor: '#FCE4D6' }]}>
            <Text style={styles.promoTitle}>Super Fast Delivery Logs</Text>
            <Text style={styles.promoSub}>Direct WhatsApp integrated tracking dispatcher</Text>
            <Text style={styles.promoBadge}>LIVE FEED</Text>
          </View>
        </ScrollView>

        <View style={styles.deliveryPricingCard}>
          <Text style={{ fontSize: 22 }}>🛵</Text>
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.deliveryLabel}>Logistics Base Charge Factor</Text>
            <Text style={styles.deliveryPriceBold}>₹{perKmCharge} <Text style={{ fontSize: 13, fontWeight: '500', color: '#7F8C8D' }}>per km radius</Text></Text>
          </View>
          <View style={styles.livePulseDot} />
        </View>

        <View style={[styles.swiggyPolicyAlertCard, { marginTop: -4, marginBottom: 16 }]}>
          <Text style={{ fontSize: 20, marginRight: 10 }}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.swiggyPolicyTitle}>Important Non-Cancellation Policy</Text>
            <Text style={styles.swiggyPolicyBody}>Once an order data package is locked and dispatched via terminal nodes, it <Text style={{ fontWeight: 'bold', color: '#C0392B' }}>cannot be cancelled or refunded</Text> under any context or reason.</Text>
          </View>
        </View>

        <View style={styles.categoryPillWrapperRow}>
          {filterCategories.map((cat) => (
            <TouchableOpacity key={cat} style={[styles.filterCategoryPill, activeCategoryFilter === cat && styles.filterCategoryActivePill]} onPress={() => setActiveCategoryFilter(cat)}>
              <Text style={[styles.filterCategoryText, activeCategoryFilter === cat && styles.filterCategoryActiveText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionHeader}>Kitchen Clusters Near You</Text>

        {filteredRestaurants.length === 0 ? (
          <View style={styles.emptyStateBox}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🕵️‍♂️</Text>
            <Text style={{ color: '#7F8C8D', fontWeight: '700' }}>No cluster node found matching credentials.</Text>
          </View>
        ) : (
          filteredRestaurants.map((res) => (
            <TouchableOpacity key={res.id} style={styles.restaurantWideCard} activeOpacity={0.9} onPress={() => { setActiveRestaurant(res); setCurrentScreen('Menu'); }}>
              <ImageBackground source={{ uri: res.image }} style={styles.restaurantCardBackgroundCover} imageStyle={{ borderRadius: 12 }}>
                <View style={styles.cardImageDarkOverlayCover}>
                  <View style={styles.cardPremiumTopPatchRow}>
                    <View style={styles.restaurantTagBadge}><Text style={styles.restaurantTagText}>{res.rating} ★ Rating</Text></View>
                    <View style={[styles.restaurantTagBadge, { backgroundColor: '#2E86C1' }]}><Text style={[styles.restaurantTagText, { color: '#FFF' }]}>{res.type}</Text></View>
                  </View>
                </View>
              </ImageBackground>
              
              <View style={{ paddingVertical: 10, paddingHorizontal: 4 }}>
                <Text style={styles.restaurantMainTitleText}>{res.name}</Text>
                <Text style={styles.restaurantSubtagsLine}>{res.tags}</Text>
                <View style={styles.actionPromptIndicatorRow}>
                  <Text style={styles.promptActionLabelText}>View Inside Dishes Matrix</Text>
                  <Text style={styles.promptActionArrowIcon}>➔</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      <GlobalCartStrip onCheckoutTrigger={onOpenCheckout} />

      {/* Secret Admin Pin Modal */}
      <Modal visible={pinModalVisible} transparent={true} animationType="fade">
        <View style={styles.centeredModalOverlayCenter}>
          <View style={styles.adminPinCardBoxView}>
            <Text style={styles.adminModalTitle}>Secure Control Node</Text>
            <TextInput style={styles.adminPinInputLargeField} placeholder="Enter Access Passkey" secureTextEntry={true} value={enteredPin} onChangeText={setEnteredPin} />
            <TouchableOpacity style={styles.adminGiantUnlockButtonBig} onPress={() => {
              if (enteredPin === 'foodifyoadminaccess6699') { setPinModalVisible(false); setEnteredPin(''); setCurrentScreen('Admin'); }
              else { alert("Wrong Passkey!"); setPinModalVisible(false); setEnteredPin(''); }
            }}>
              <Text style={styles.adminGiantButtonTextText}>UNLOCK PANEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Address Management Modal */}
      <Modal visible={addressModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={[styles.checkoutModalSheet, { height: height * 0.85 }]}>
            <View style={styles.modalTopNavRow}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: '#2C3E50' }}>📍 Delivery Address Configuration</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)} style={styles.modalBackButtonIcon}><Text>✕</Text></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <TextInput style={styles.checkoutInputCompact} placeholder="Receiver Name *" value={addrForm.name} onChangeText={t => setAddrForm({...addrForm, name: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Phone Contact *" keyboardType="phone-pad" value={addrForm.phone} onChangeText={t => setAddrForm({...addrForm, phone: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Flat / House / Plot No. *" value={addrForm.flatNo} onChangeText={t => setAddrForm({...addrForm, flatNo: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Area / Colony / Street *" value={addrForm.area} onChangeText={t => setAddrForm({...addrForm, area: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Landmark Reference" value={addrForm.landmark} onChangeText={t => setAddrForm({...addrForm, landmark: t})} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TextInput style={[styles.checkoutInputCompact, { flex: 1 }]} placeholder="City" value={addrForm.city} onChangeText={t => setAddrForm({...addrForm, city: t})} />
                <TextInput style={[styles.checkoutInputCompact, { flex: 1 }]} placeholder="Pincode" keyboardType="numeric" value={addrForm.pincode} onChangeText={t => setAddrForm({...addrForm, pincode: t})} />
              </View>
              <TouchableOpacity style={[styles.paySelectButton, { marginTop: 14, backgroundColor: '#16A085', height: 42 }]} onPress={() => { savePermanentAddress(addrForm); setAddressModalVisible(false); }}>
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save Delivery Destination</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ==========================================
// 5. RESTAURANT MENU VIEW WITH CATEGORIES
// ==========================================
function RestaurantMenuScreen({ onOpenCheckout }) {
  const { cart, addToCart, updateQty, activeRestaurant, setCurrentScreen } = useOrder();
  const [selectedMenuTab, setSelectedMenuTab] = useState('All');

  if (!activeRestaurant) return null;

  const categories = ['All', ...new Set(activeRestaurant.menu.map(dish => dish.category || 'Main Course'))];
  const filteredMenu = activeRestaurant.menu.filter(dish => selectedMenuTab === 'All' || (dish.category || 'Main Course') === selectedMenuTab);

  return (
    <SafeAreaView style={styles.safeAreaAdaptiveContainer}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButtonText}>← Kitchen Grid</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.subScreenContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.menuHeaderVisualBox}>
          <Text style={styles.menuMainTitle}>{activeRestaurant.name}</Text>
          <Text style={styles.menuSubtitle}>{activeRestaurant.type} • {activeRestaurant.tags}</Text>
          <View style={styles.menuHorizontalDottedDivider} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 15, flexDirection: 'row' }}>
          {categories.map(tab => (
            <TouchableOpacity key={tab} style={[styles.menuTabPillButton, selectedMenuTab === tab && styles.menuTabPillActive]} onPress={() => setSelectedMenuTab(tab)}>
              <Text style={[styles.menuTabPillText, selectedMenuTab === tab && { color: '#FFF' }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filteredMenu.length === 0 ? (
          <Text style={styles.emptyMenuTextLog}>No dishes linked under this configuration tab.</Text>
        ) : (
          filteredMenu.map((dish) => {
            const currentQty = cart.find(i => i.id === dish.id)?.qty || 0;
            return (
              <View key={dish.id} style={styles.dishCard}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[styles.vegIndicatorFrame, { borderColor: dish.isVeg ? '#27AE60' : '#C0392B' }]}>
                      <View style={[styles.vegIndicatorDot, { backgroundColor: dish.isVeg ? '#27AE60' : '#C0392B' }]} />
                    </View>
                    <Text style={styles.dishNameText}>{dish.name}</Text>
                  </View>
                  <Text style={styles.dishCategoryTagStyle}>{dish.category || 'Main Course'}</Text>
                  <Text style={styles.dishPriceText}>₹{dish.price}</Text>
                </View>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  {currentQty === 0 ? (
                    <TouchableOpacity style={styles.addBtnContainer} onPress={() => addToCart(dish, activeRestaurant.name, activeRestaurant.id)}>
                      <Text style={styles.addBtnText}>ADD</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.qtyControlRow}>
                      <TouchableOpacity onPress={() => updateQty(dish.id, -1)} style={styles.qtyActionBtn}><Text style={styles.qtyActionText}>-</Text></TouchableOpacity>
                      <Text style={styles.qtyValueText}>{currentQty}</Text>
                      <TouchableOpacity onPress={() => updateQty(dish.id, 1)} style={styles.qtyActionBtn}><Text style={styles.qtyActionText}>+</Text></TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 160 }} />
      </ScrollView>

      <GlobalCartStrip onCheckoutTrigger={onOpenCheckout} />
    </SafeAreaView>
  );
}

// ==========================================
// 6. EXACT FIXED CHECKOUT MODAL SHEET ENGINE
// ==========================================
function ExactCheckoutModal({ visible, onClose }) {
  const { cart, getSubtotal, getPackingCharge, getGrandTotal, sendWhatsAppOrder, clearCart, setCurrentScreen, savedAddress, savePermanentAddress, packingChargePerRes, perKmCharge } = useOrder();
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [form, setForm] = useState({ name: '', phone: '', flatNo: '', area: '', landmark: '', city: '', pincode: '' });
  const [specialInstructions, setSpecialInstructions] = useState({});

  useEffect(() => { if (visible && savedAddress) setForm(savedAddress); }, [visible, savedAddress]);

  if (cart.length === 0) return null;
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.restaurantId]) acc[item.restaurantId] = { name: item.restaurantName, items: [] };
    acc[item.restaurantId].items.push(item);
    return acc;
  }, {});

  const handleValidationAndDispatch = () => {
    if (!form.name || !form.phone || !form.flatNo || !form.area) {
      Alert.alert("Data Stream Empty", "Please fill in all standard required fields (*) to lock logistics nodes.");
      return;
    }
    savePermanentAddress(form); 
    sendWhatsAppOrder(form, specialInstructions, paymentMethod);
    clearCart(); 
    onClose(); 
    setCurrentScreen('Home');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay} keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 10}>
        <View style={[styles.checkoutModalSheet, { flex: 1, maxHeight: height * 0.92 }]}>
          
          <View style={styles.modalTopNavRow}>
            <TouchableOpacity onPress={onClose} style={styles.modalBackButtonIcon}><Text style={{ fontWeight: 'bold', fontSize: 16 }}>←</Text></TouchableOpacity>
            <Text style={styles.swiggyHeaderTitle}>Verify Bill Logistics Matrix</Text>
            <Text style={{ fontSize: 12, color: '#666', fontWeight: '700' }}>{cart.reduce((sum, i) => sum + i.qty, 0)} Units</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            
            <View style={styles.swiggyAddressInlineCard}>
              <Text style={styles.inlineCardTitle}>📍 Active Dispatch Destination Coordinates</Text>
              <TextInput style={styles.checkoutInputCompact} placeholder="Receiver Name *" value={form.name} onChangeText={t => setForm({...form, name: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Phone Contact *" keyboardType="phone-pad" value={form.phone} onChangeText={t => setForm({...form, phone: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Flat / House / Plot No. *" value={form.flatNo} onChangeText={t => setForm({...form, flatNo: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Area / Colony / Street *" value={form.area} onChangeText={t => setForm({...form, area: t})} />
              <TextInput style={styles.checkoutInputCompact} placeholder="Landmark Reference (Optional)" value={form.landmark} onChangeText={t => setForm({...form, landmark: t})} />
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TextInput style={[styles.checkoutInputCompact, { flex: 1 }]} placeholder="City" value={form.city} onChangeText={t => setForm({...form, city: t})} />
                <TextInput style={[styles.checkoutInputCompact, { flex: 1 }]} placeholder="Pincode" keyboardType="number-pad" value={form.pincode} onChangeText={t => setForm({...form, pincode: t})} />
              </View>
            </View>

            {Object.keys(groupedCart).map((resId, idx) => {
              const group = groupedCart[resId];
              const groupItemTotal = group.items.reduce((sum, i) => sum + (i.price * i.qty), 0);
              return (
                <View key={resId} style={styles.swiggyRestaurantBlock}>
                  <Text style={styles.swiggyResTitleText}><Text style={{ color: '#D35400' }}>{idx + 1}.</Text> {group.name}</Text>
                  
                  {group.items.map((item) => (
                    <View key={item.id} style={styles.swiggyItemBillRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={{ fontSize: 10 }}>🟢</Text>
                        <Text style={styles.swiggyItemNameText}>{item.name}</Text>
                      </View>
                      <Text style={{ fontSize: 12, color: '#7F8C8D', fontWeight: '600' }}>x{item.qty}</Text>
                      <Text style={styles.swiggyItemPriceText}>₹{item.price * item.qty}</Text>
                    </View>
                  ))}
                  
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#5D6D7E', letterSpacing: 0.2 }}>📋 KITCHEN HANDLER DIRECTIONS ({group.name.toUpperCase()}):</Text>
                    <TextInput style={styles.swiggyInstructionField} placeholder="e.g., Make it extra spicy" value={specialInstructions[resId] || ''} onChangeText={(v) => setSpecialInstructions(prev => ({ ...prev, [resId]: v }))} />
                  </View>
                  
                  <View style={styles.subtotalBannerGreenHighlightedContainer}>
                    <Text style={styles.greenHighlightBannerTextLabel}>Subtotal + Packing Setup ({group.name})</Text>
                    <Text style={styles.greenHighlightBannerTextValue}>₹{groupItemTotal + packingChargePerRes}</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.swiggyBillSummaryCard}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: '#2C3E50', marginBottom: 8 }}>Consolidated Ledger Account</Text>
              <View style={styles.swiggyBillLine}><Text style={styles.swiggyBillLabel}>Raw Base Items Subtotal</Text><Text style={styles.swiggyBillVal}>₹{getSubtotal()}</Text></View>
              <View style={styles.swiggyBillLine}><Text style={styles.swiggyBillLabel}>Hub Packaging Fixed Factors (₹{packingChargePerRes} × {Object.keys(groupedCart).length})</Text><Text style={styles.swiggyBillVal}>₹{getPackingCharge()}</Text></View>
              <View style={styles.swiggyThickDivider} />
              <View style={styles.swiggyBillLine}>
                <View>
                  <Text style={styles.swiggyBillLabelBold}>On-Route Logistics Fleet Matrix</Text>
                  <Text style={{ fontSize: 11, color: '#27AE60', fontWeight: '700' }}>Radius Unit Factor Base: ₹{perKmCharge}/km</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#E67E22', fontWeight: '900', backgroundColor: '#FDF2E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>CALCULATED LIVE</Text>
              </View>
            </View>

            <View style={styles.swiggyPolicyAlertCard}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.swiggyPolicyTitle}>Important Non-Cancellation Policy</Text>
                <Text style={styles.swiggyPolicyBody}>Once an order data package is locked and dispatched via terminal nodes, it <Text style={{ fontWeight: 'bold', color: '#C0392B' }}>cannot be cancelled or refunded</Text> under any context or reason.</Text>
              </View>
            </View>

            <View style={styles.swiggyPaymentSelectorBox}>
              <Text style={styles.paymentBoxHeading}>Choose Settlement Protocol</Text>
              <View style={styles.paymentButtonGridRow}>
                <TouchableOpacity style={[styles.paySelectButton, paymentMethod === 'UPI' && styles.paySelectActive]} onPress={() => setPaymentMethod('UPI')}>
                  <Text style={[styles.paySelectText, paymentMethod === 'UPI' && { color: '#1B4F72', fontWeight: '900' }]}>📱 Instant UPI Gateway</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.paySelectButton, paymentMethod === 'COD' && styles.paySelectActive]} onPress={() => setPaymentMethod('COD')}>
                  <Text style={[styles.paySelectText, paymentMethod === 'COD' && { color: '#1B4F72', fontWeight: '900' }]}>💵 Cash Handover (COD)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View style={styles.swiggyStickyBottomActionFrame}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, color: '#7F8C8D', fontWeight: '700' }}>TOTAL AMOUNT DUE</Text>
              <Text style={styles.swiggyGrandTotalVal}>₹{getGrandTotal()} <Text style={{ fontSize: 11, fontWeight: '500', color: '#7F8C8D' }}>+ Live Delivery</Text></Text>
            </View>
            <TouchableOpacity style={styles.swiggyMainGreenCta} onPress={handleValidationAndDispatch}>
              <Text style={styles.swiggyGreenCtaText}>Place Order via WhatsApp 🚀</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ==========================================
// 7. ADMIN MANAGEMENT CONSOLE TERMINAL
// ==========================================
function AdminDashboardScreen() {
  const { 
    setCurrentScreen, adminWhatsAppNumber, upiId, perKmCharge, packingChargePerRes, updateSettings, 
    resName, setResName, resType, setResType, resTags, setResTags, addRestaurant, restaurants, removeRestaurant,
    dishName, setDishName, dishPrice, setDishPrice, dishCategory, setDishCategory, dishIsVeg, setDishIsVeg,
    selectedResIdForDish, setSelectedResIdForDish, addDishToRestaurant, removeDishFromRestaurant
  } = useOrder();

  const [setPhone, setSetPhone] = useState(adminWhatsAppNumber);
  const [setUpi, setSetUpi] = useState(upiId);
  const [setKm, setSetKm] = useState(String(perKmCharge));
  const [setPack, setSetPack] = useState(String(packingChargePerRes));
  
  // New States for User Database Inspection
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [userList, setUserList] = useState([]);

  const runHubDeployment = () => {
    if (!resName || !resType) { alert("Missing fields!"); return; }
    addRestaurant(resName, resType, resTags || 'General');
    setResName(''); setResType(''); setResTags('');
    alert("New Node Initialized successfully.");
  };

  const runDishDeployment = () => {
    if (!selectedResIdForDish || !dishName || !dishPrice) { alert("Missing fields!"); return; }
    addDishToRestaurant(selectedResIdForDish, dishName, dishPrice, dishCategory || 'Main Course', dishIsVeg);
    setDishName(''); setDishPrice(''); setDishCategory('');
    alert("Dish Model linked to target database.");
  };

  // Fetch all users dynamically from AsyncStorage map layer
  const fetchRegisteredUserDatabase = async () => {
    try {
      const storedUsersRaw = await AsyncStorage.getItem('FOODIFYO_USER_REGISTRY');
      if (storedUsersRaw) {
        const parsed = JSON.parse(storedUsersRaw);
        const formattedArray = Object.keys(parsed).map(email => ({
          email,
          name: parsed[email]?.name || 'N/A',
          password: parsed[email]?.password || (typeof parsed[email] === 'string' ? parsed[email] : 'N/A')
        }));
        setUserList(formattedArray);
      } else {
        setUserList([]);
      }
      setUserModalVisible(true);
    } catch (e) {
      alert("Error reading registry database structure.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBFCFC', paddingTop: STATUSBAR_PADDING }}>
      <View style={{ paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EAEDED', paddingBottom: 10 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => setCurrentScreen('Home')}>
          <Text style={styles.backButtonText}>← Exit System Console Terminal</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 22, fontWeight: '900', color: '#1C2833', marginTop: 4 }}>Master System Configurations Matrix</Text>
      </View>

      <ScrollView style={{ paddingHorizontal: 16, marginTop: 10 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.swiggyAddressInlineCard}>
          <Text style={styles.inlineCardTitle}>⚙️ Core Financial & Logistics Factors</Text>
          <Text style={styles.adminFieldLabel}>Admin Delivery Target WhatsApp Connection Node</Text>
          <TextInput style={styles.checkoutInputCompact} placeholder="WhatsApp Number" value={setPhone} onChangeText={setSetPhone} />
          
          <Text style={styles.adminFieldLabel}>UPI Gateway Merchant Address Node (VPA)</Text>
          <TextInput style={styles.checkoutInputCompact} placeholder="merchant@upi" value={setUpi} onChangeText={setSetUpi} />
          
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminFieldLabel}>Km Multiplier Rate</Text>
              <TextInput style={styles.checkoutInputCompact} placeholder="₹ per km" keyboardType="numeric" value={setKm} onChangeText={setSetKm} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.adminFieldLabel}>Hub Packing Rate Factor</Text>
              <TextInput style={styles.checkoutInputCompact} placeholder="₹ per restaurant" keyboardType="numeric" value={setPack} onChangeText={setSetPack} />
            </View>
          </View>
          
          <TouchableOpacity style={[styles.paySelectButton, { backgroundColor: '#2C3E50', height: 40, marginTop: 10 }]} onPress={() => { updateSettings(setPhone, setUpi, setKm, setPack); alert("Central Core Configuration Dispatched!"); }}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>Flash System Variables Pipeline</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.swiggyAddressInlineCard}>
          <Text style={styles.inlineCardTitle}>🏬 Deploy New Cluster Cuisine Hub Node</Text>
          <TextInput style={styles.checkoutInputCompact} placeholder="Brand Name Label *" value={resName} onChangeText={setResName} />
          <TextInput style={styles.checkoutInputCompact} placeholder="Descriptor Subtitle *" value={resType} onChangeText={setResType} />
          <TextInput style={styles.checkoutInputCompact} placeholder="Search Index Keywords Tag" value={resTags} onChangeText={setResTags} />
          <TouchableOpacity style={[styles.paySelectButton, { backgroundColor: '#1E8449', height: 40, marginTop: 8 }]} onPress={runHubDeployment}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>Initialize Hub Cluster Data Array</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.swiggyAddressInlineCard}>
          <Text style={styles.inlineCardTitle}>🍕 Inject Item into Target Cluster Node</Text>
          <Text style={styles.adminFieldLabel}>Target Hub Cluster Select Array Node</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, flexDirection: 'row' }}>
            {restaurants.map(r => (
              <TouchableOpacity key={r.id} style={[styles.adminResMiniPill, selectedResIdForDish === r.id && styles.adminResMiniPillActive]} onPress={() => setSelectedResIdForDish(r.id)}>
                <Text style={[{ fontSize: 11, fontWeight: '700', color: '#5D6D7E' }, selectedResIdForDish === r.id && { color: '#FFF' }]}>{r.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput style={styles.checkoutInputCompact} placeholder="Dish Name Label *" value={dishName} onChangeText={setDishName} />
          <TextInput style={styles.checkoutInputCompact} placeholder="Price Numerical Factor *" keyboardType="numeric" value={dishPrice} onChangeText={setDishPrice} />
          <TextInput style={styles.checkoutInputCompact} placeholder="Menu Filter Category Tab" value={dishCategory} onChangeText={setDishCategory} />
          
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#5D6D7E' }}>Classification Rule Vector:</Text>
            <TouchableOpacity style={[styles.vegRuleMiniButton, dishIsVeg && { backgroundColor: '#E8F8F5', borderColor: '#27AE60' }]} onPress={() => setDishIsVeg(true)}>
              <Text style={{ color: '#27AE60', fontWeight: '800', fontSize: 11 }}>🟢 PURE VEG</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.vegRuleMiniButton, !dishIsVeg && { backgroundColor: '#FADBD8', borderColor: '#C0392B' }]} onPress={() => setDishIsVeg(false)}>
              <Text style={{ color: '#C0392B', fontWeight: '800', fontSize: 11 }}>🔴 NON-VEG / MIX</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.paySelectButton, { backgroundColor: '#D35400', height: 40, marginTop: 6 }]} onPress={runDishDeployment}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>Flash Item Vector Database</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.swiggyAddressInlineCard}>
          <Text style={styles.inlineCardTitle}>📊 Live Cluster Node Registry File System Inspector</Text>
          {restaurants.map(res => (
            <View key={res.id} style={styles.adminInspectorRowBlock}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#2C3E50' }}>{res.name} <Text style={{ fontSize: 11, fontWeight: '400', color: '#7F8C8D' }}>({res.id})</Text></Text>
                <Text style={{ fontSize: 11, color: '#7F8C8D', fontWeight: '600' }}>Contains: {res.menu.length} registered item links.</Text>
                
                {res.menu.map(d => (
                  <View key={d.id} style={styles.adminInspectorDishSubline}>
                    <Text style={{ fontSize: 12, color: '#5D6D7E', flex: 1 }}>• {d.name} (₹{d.price})</Text>
                    <TouchableOpacity onPress={() => removeDishFromRestaurant(res.id, d.id)}>
                      <Text style={{ fontSize: 11, color: '#E74C3C', fontWeight: '800' }}>[Delete Item]</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <TouchableOpacity style={styles.adminResDeleteIconButton} onPress={() => {
                Alert.alert("Destroy Cluster Link", `Wipe ${res.name} data array permanently?`, [
                  { text: 'Aborted Routing' },
                  { text: 'Execute Wipeout', onPress: () => removeRestaurant(res.id) }
                ]);
              }}>
                <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 11 }}>WIPE HUB</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* NEW SYSTEM CORE: ACCESSIBLE USER REGISTRY DATABASE TERMINAL AT BOTTOM */}
        <View style={[styles.swiggyAddressInlineCard, { marginBottom: 60, borderColor: '#3498DB', borderWidth: 1.5 }]}>
          <Text style={[styles.inlineCardTitle, { color: '#2980B9' }]}>👥 Registered User Identity Core</Text>
          <Text style={{ fontSize: 12, color: '#7F8C8D', fontWeight: '600', marginBottom: 10 }}>View real-time profiles metrics of all verified users registered within this terminal.</Text>
          
          <TouchableOpacity style={[styles.paySelectButton, { backgroundColor: '#2980B9', height: 44 }]} onPress={fetchRegisteredUserDatabase}>
            <Text style={{ color: '#FFF', fontWeight: '900', fontSize: 13 }}>📂 ACCESS THE ALL DATA / DATABASE</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* NEW SYSTEM CORE: DATABASE LIVE INSPECTOR VIEW OVERLAY MODAL */}
      <Modal visible={userModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.checkoutModalSheet, { height: height * 0.82 }]}>
            <View style={styles.modalTopNavRow}>
              <Text style={{ fontSize: 15, fontWeight: '900', color: '#1A1A1A' }}>📁 Master Identity Registry Terminal</Text>
              <TouchableOpacity onPress={() => setUserModalVisible(false)} style={styles.modalBackButtonIcon}><Text style={{fontWeight: 'bold'}}>✕</Text></TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              {userList.length === 0 ? (
                <View style={{ alignItems: 'center', padding: 40 }}>
                  <Text style={{ color: '#7F8C8D', fontWeight: '700' }}>Zero user accounts records initialized inside database node.</Text>
                </View>
              ) : (
                userList.map((user, idx) => (
                  <View key={user.email} style={styles.userDataCardPipelineRow}>
                    <View style={styles.userDataBadgeCounter}><Text style={{ color: '#FFF', fontWeight: '900', fontSize: 11 }}>{idx + 1}</Text></View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: '#2C3E50' }}>👤 Name: <Text style={{ fontWeight: '600', color: '#566573' }}>{user.name}</Text></Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#2C3E50', marginTop: 2 }}>✉️ Email: <Text style={{ fontWeight: '500', color: '#566573' }}>{user.email}</Text></Text>
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#2C3E50', marginTop: 2 }}>🔑 Pass: <Text style={{ fontWeight: '700', color: '#E67E22' }}>{user.password}</Text></Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ==========================================
// 8. SYSTEM ROUTING ARCHITECTURE APPS NODE
// ==========================================
export default function App() {
  return (
    <OrderProvider>
      <AppContainer />
    </OrderProvider>
  );
}

function AppContainer() {
  const { currentScreen } = useOrder();
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {currentScreen === 'Splash' && <SplashScreen />}
      {currentScreen === 'Terms' && <TermsAndConditionsScreen />}
      {currentScreen === 'Auth' && <AuthGateScreen />}
      {currentScreen === 'Home' && <HomeDashboard onOpenCheckout={() => setCheckoutVisible(true)} />}
      {currentScreen === 'Menu' && <RestaurantMenuScreen onOpenCheckout={() => setCheckoutVisible(true)} />}
      {currentScreen === 'Admin' && <AdminDashboardScreen />}
      <ExactCheckoutModal visible={checkoutVisible} onClose={() => setCheckoutVisible(false)} />
    </View>
  );
}

// ==========================================
// 9. MASSIVE MASTER SPEC DESIGN CORE SHEET
// ==========================================
const styles = StyleSheet.create({
  safeAreaAdaptiveContainer: { flex: 1, backgroundColor: '#FAFAFA', paddingTop: STATUSBAR_PADDING },
  subScreenContainer: { flex: 1, paddingHorizontal: 16 },
  
  termsWrapperMain: { flex: 1, backgroundColor: '#FBFCFC', paddingHorizontal: 16 },
  termsHeaderBlock: { alignItems: 'center', marginTop: Platform.OS === 'android' ? STATUSBAR_PADDING : 10, marginBottom: 10 },
  termsHeadingText: { fontSize: 20, fontWeight: '900', color: '#1A1A1A', textAlign: 'center' },
  termsDecorativeBar: { width: 60, height: 4, backgroundColor: '#E67E22', borderRadius: 2, marginTop: 6 },
  termsScrollingContent: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', padding: 14, marginBottom: 10 },
  termsSectionTitle: { fontSize: 14, fontWeight: '800', color: '#2C3E50', marginTop: 14, marginBottom: 4 },
  termsBodyText: { fontSize: 12, color: '#566573', lineHeight: 18, fontWeight: '500' },
  termsFooterStatement: { fontSize: 12, color: '#2C3E50', fontWeight: '700', fontStyle: 'italic', marginTop: 16, borderTopWidth: 1, borderTopColor: '#EAEDED', paddingTop: 10, textAlign: 'center' },
  termsBottomStickyBlock: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 14, elevation: 4 },
  termsCheckboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingVertical: 4 },
  termsCustomCheckboxBox: { width: 20, height: 20, borderWidth: 2, borderColor: '#BDC3C7', borderRadius: 5, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  termsCheckboxCheckedState: { backgroundColor: '#27AE60', borderColor: '#27AE60' },
  termsCheckboxCheckmarkEmblem: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  termsCheckboxLabelText: { fontSize: 13, fontWeight: '800', color: '#2C3E50' },
  termsActionContinueBtn: { backgroundColor: '#E67E22', height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  termsActionContinueBtnDisabled: { backgroundColor: '#BDC3C7', elevation: 0 },
  termsActionContinueBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  splashNewContainer: { flex: 1, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  fallbackLogoContainer: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  splashGraphicRingOuter: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#FEF9E7', justifyContent: 'center', alignItems: 'center', marginBottom: 25, borderWidth: 2, borderColor: '#FADBD8' },
  splashGraphicRingInner: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#FADBD8', justifyContent: 'center', alignItems: 'center' },
  splashIconEmblem: { fontSize: 46 },
  splashTaglineText: { fontSize: 14, color: '#7F8C8D', fontWeight: '700', marginTop: 8, letterSpacing: 0.6 },
  splashProgressBarTrack: { width: 180, height: 5, backgroundColor: '#EAEDED', borderRadius: 2.5, marginTop: 28, overflow: 'hidden' },
  splashProgressBarFiller: { width: '75%', height: '100%', backgroundColor: '#D35400', borderRadius: 2.5 },

  authWrapperMain: { flex: 1, backgroundColor: '#FBFCFC', paddingHorizontal: 20 },
  authCardWidgetFrame: { backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#EAEAEA', elevation: 4 },
  authBrandingHeaderBlock: { alignItems: 'center', marginBottom: 20 },
  authLogoGraphic: { fontSize: 42, marginBottom: 8 },
  authWelcomeHeadingText: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 },
  authDescriptorSubText: { fontSize: 12, color: '#7F8C8D', textAlign: 'center', marginTop: 4, fontWeight: '600', paddingHorizontal: 10 },
  authPrimaryActionBtn: { backgroundColor: '#E67E22', height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 16, elevation: 2 },
  authPrimaryBtnTextLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.2 },
  authToggleModeButtonPill: { paddingVertical: 12, marginTop: 8, alignItems: 'center' },
  authToggleModeLinkText: { color: '#2980B9', fontSize: 13, fontWeight: '700' },

  authPasswordInputContainerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#D5DBDB', borderRadius: 8, height: 40, marginBottom: 8, paddingRight: 4 },
  authPasswordInputFieldFlex: { flex: 1, paddingHorizontal: 12, fontSize: 13, color: '#333', fontWeight: '600', height: '100%' },
  authEyeButtonTogglePill: { width: 36, height: '100%', justifyContent: 'center', alignItems: 'center' },
  authEyeIconLabelText: { fontSize: 14 },

  homeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 12 },
  foodfiyoBrandText: { fontSize: 26, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.6 },
  homeAddressSubtext: { color: '#7F8C8D', fontSize: 12, fontWeight: '700', maxWidth: width * 0.55 },
  supportButtonPill: { backgroundColor: '#F2F4F4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 22, borderWidth: 1, borderColor: '#E5E8E8' },
  supportButtonText: { color: '#7F8C8D', fontSize: 11, fontWeight: '800' },
  
  searchBarWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 14, height: 46, borderRadius: 14, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 14, elevation: 1 },
  searchBarInput: { flex: 1, fontSize: 14, color: '#333', fontWeight: '600' },
  
  promoBannerContainer: { flexDirection: 'row', marginBottom: 16 },
  promoCard: { width: width * 0.75, padding: 14, borderRadius: 14, marginRight: 10, justifyContent: 'center', height: 90, borderWidth: 0.5, borderColor: '#BDC3C7' },
  promoTitle: { fontSize: 14, fontWeight: '900', color: '#2C3E50' },
  promoSub: { fontSize: 11, color: '#566573', marginTop: 2, fontWeight: '600' },
  promoBadge: { alignSelf: 'flex-start', fontSize: 9, fontWeight: '900', backgroundColor: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 8, color: '#2C3E50' },

  deliveryPricingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9F9', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#E5E8E8', marginBottom: 16 },
  deliveryLabel: { fontSize: 11, color: '#7F8C8D', fontWeight: '800' },
  deliveryPriceBold: { fontSize: 17, fontWeight: '900', color: '#2C3E50', marginTop: 1 },
  livePulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27AE60', marginRight: 4 },
  
  categoryPillWrapperRow: { flexDirection: 'row', marginBottom: 16, gap: 6 },
  filterCategoryPill: { backgroundColor: '#F2F4F4', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: '#EAEDED' },
  filterCategoryActivePill: { backgroundColor: '#2C3E50', borderColor: '#2C3E50' },
  filterCategoryText: { fontSize: 12, fontWeight: '700', color: '#5D6D7E' },
  filterCategoryActiveText: { color: '#FFF' },
  
  sectionHeader: { fontSize: 17, fontWeight: '900', color: '#1A1A1A', marginBottom: 12, letterSpacing: -0.2 },
  emptyStateBox: { alignItems: 'center', padding: 40, justifyContent: 'center' },

  restaurantWideCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 8, marginBottom: 14, borderWidth: 1, borderColor: '#EAEAEA', elevation: 2 },
  restaurantCardBackgroundCover: { height: 130, width: '100%', justifyContent: 'flex-end' },
  cardImageDarkOverlayCover: { height: '100%', width: '100%', backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'flex-start', padding: 8, borderRadius: 12, overflow: 'hidden' },
  cardPremiumTopPatchRow: { flexDirection: 'row', gap: 6 },
  restaurantTagBadge: { backgroundColor: '#FFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, elevation: 1 },
  restaurantTagText: { fontSize: 11, color: '#2C3E50', fontWeight: '900' },
  restaurantMainTitleText: { fontSize: 18, fontWeight: '900', color: '#2C3E50', marginTop: 4 },
  restaurantSubtagsLine: { fontSize: 12, color: '#7F8C8D', marginTop: 2, fontWeight: '600' },
  actionPromptIndicatorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F2F4F4' },
  promptActionLabelText: { fontSize: 12, color: '#D35400', fontWeight: '800' },
  promptActionArrowIcon: { fontSize: 12, color: '#D35400', fontWeight: '900' },

  backButton: { alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 14, backgroundColor: '#EAECEE', borderRadius: 8, marginTop: 10, marginBottom: 12 },
  backButtonText: { fontSize: 12, fontWeight: '800', color: '#5D6D7E' },
  menuHeaderVisualBox: { marginTop: 4, marginBottom: 14 },
  menuMainTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.4 },
  menuSubtitle: { fontSize: 12, color: '#7F8C8D', marginTop: 3, fontWeight: '600' },
  menuHorizontalDottedDivider: { height: 1, backgroundColor: '#BDC3C7', marginVertical: 12, borderStyle: 'dashed' },
  
  menuTabPillButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#EAECEE', marginRight: 6, borderWidth: 0.5, borderColor: '#BDC3C7' },
  menuTabPillActive: { backgroundColor: '#D35400', borderColor: '#D35400' },
  menuTabPillText: { fontSize: 12, fontWeight: '800', color: '#5D6D7E' },
  emptyMenuTextLog: { textAlign: 'center', padding: 30, color: '#7F8C8D', fontWeight: '700' },

  dishCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 14, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F2F4F4', elevation: 1 },
  vegIndicatorFrame: { width: 14, height: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', borderRadius: 3 },
  vegIndicatorDot: { width: 6, height: 6, borderRadius: 3 },
  dishNameText: { fontSize: 15, fontWeight: '800', color: '#2C3E50', flexShrink: 1 },
  dishCategoryTagStyle: { fontSize: 11, color: '#7F8C8D', fontWeight: '700', marginTop: 2 },
  dishPriceText: { fontSize: 14, fontWeight: '900', color: '#2C3E50', marginTop: 4 },
  
  addBtnContainer: { backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#D35400', paddingHorizontal: 22, paddingVertical: 7, borderRadius: 10, elevation: 1 },
  addBtnText: { color: '#D35400', fontWeight: '900', fontSize: 13 },
  qtyControlRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D35400', borderRadius: 10, overflow: 'hidden', elevation: 1 },
  qtyActionBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#BA4A00' },
  qtyActionText: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  qtyValueText: { color: '#FFF', paddingHorizontal: 10, fontWeight: '900', fontSize: 13 },
  
  globalCartBarFrame: { position: 'absolute', bottom: OVERLAP_SAFETY_MARGIN, left: 12, right: 12, backgroundColor: '#111', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, elevation: 8 },
  globalCartLeftBlock: { flex: 1 },
  globalCartMainText: { color: '#FFF', fontSize: 14, fontWeight: '900' },
  globalCartSubText: { color: '#AAA', fontSize: 11, fontWeight: '600' },
  globalCartRightBlock: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  globalCartPrice: { color: '#FFF', fontSize: 15, fontWeight: '900', marginRight: 4 },
  globalCartCtaBtn: { backgroundColor: '#D35400', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  globalCartCtaText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  globalCartExitCross: { paddingVertical: 6, paddingHorizontal: 8, backgroundColor: '#222', borderRadius: 8 },
  globalCartExitText: { color: '#FF7675', fontSize: 11, fontWeight: '800' },

  centeredModalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  adminPinCardBoxView: { width: width * 0.85, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 22, elevation: 12 },
  adminModalTitle: { fontSize: 17, fontWeight: '900', color: '#2C3E50', textAlign: 'center', marginBottom: 14 },
  adminPinInputLargeField: { backgroundColor: '#F8F9F9', borderWidth: 1.5, borderColor: '#BDC3C7', borderRadius: 10, height: 46, paddingHorizontal: 14, fontSize: 14, color: '#2C3E50', textAlign: 'center', marginBottom: 14, fontWeight: '800' },
  adminGiantUnlockButtonBig: { backgroundColor: '#D35400', borderRadius: 10, height: 46, justifyContent: 'center', alignItems: 'center' },
  adminGiantButtonTextText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  checkoutModalSheet: { backgroundColor: '#F4F6F6', borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 16 },
  modalTopNavRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#E5E8E8', marginBottom: 12 },
  modalBackButtonIcon: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E8E8' },
  swiggyHeaderTitle: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
  
  swiggyAddressInlineCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E5E8E8', marginBottom: 12, elevation: 1 },
  inlineCardTitle: { fontSize: 13, fontWeight: '900', color: '#16A085', marginBottom: 10 },
  checkoutInputCompact: { backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#D5DBDB', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 13, color: '#333', marginBottom: 8, fontWeight: '600' },
  
  swiggyRestaurantBlock: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E5E8E8', marginBottom: 12, elevation: 1 },
  swiggyResTitleText: { fontSize: 15, fontWeight: '900', color: '#1A1A1A', marginBottom: 10 },
  swiggyItemBillRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: '#F2F4F4' },
  swiggyItemNameText: { fontSize: 14, fontWeight: '700', color: '#2C3E50' },
  swiggyItemPriceText: { fontSize: 14, fontWeight: '800', color: '#1A1A1A' },
  swiggyInstructionField: { backgroundColor: '#FAFAFA', borderRadius: 8, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#2C3E50', marginTop: 6, borderWidth: 1, borderColor: '#E5E8E8', fontWeight: '600' },
  subtotalBannerGreenHighlightedContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#E8F8F5', padding: 10, borderRadius: 10, marginTop: 12, borderWidth: 0.5, borderColor: '#A2D9CE' },
  greenHighlightBannerTextLabel: { fontSize: 12, color: '#117A65', fontWeight: '800' },
  greenHighlightBannerTextValue: { fontSize: 12, color: '#117A65', fontWeight: '900' },
  
  swiggyBillSummaryCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E5E8E8', marginBottom: 12, elevation: 1 },
  swiggyBillLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5 },
  swiggyBillLabel: { fontSize: 13, color: '#7F8C8D', fontWeight: '600' },
  swiggyBillVal: { fontSize: 13, color: '#1A1A1A', fontWeight: '800' },
  swiggyBillLabelBold: { fontSize: 14, fontWeight: '900', color: '#1A1A1A' },
  swiggyThickDivider: { height: 1, backgroundColor: '#F2F4F4', marginVertical: 8 },
  
  swiggyPolicyAlertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDEDEC', padding: 12, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#FADBD8' },
  swiggyPolicyTitle: { fontSize: 13, fontWeight: '900', color: '#C0392B' },
  swiggyPolicyBody: { fontSize: 12, color: '#C0392B', marginTop: 2, fontWeight: '500' },
  
  swiggyPaymentSelectorBox: { backgroundColor: '#FFF', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: '#E5E8E8', marginBottom: 18, elevation: 1 },
  paymentBoxHeading: { fontSize: 13, fontWeight: '900', color: '#1A1A1A', marginBottom: 10 },
  paymentButtonGridRow: { flexDirection: 'row', gap: 8 },
  paySelectButton: { flex: 1, backgroundColor: '#F2F4F4', height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#D5DBDB' },
  paySelectActive: { backgroundColor: '#EBF5FB', borderColor: '#3498DB', borderWidth: 1.5 },
  paySelectText: { fontSize: 12, fontWeight: '800', color: '#5D6D7E' },
  
  swiggyStickyBottomActionFrame: { marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 14, borderRadius: 18, elevation: 4, borderWidth: 1, borderColor: '#EAEDED' },
  swiggyGrandTotalVal: { fontSize: 20, fontWeight: '900', color: '#1A1A1A', marginTop: 1 },
  swiggyMainGreenCta: { backgroundColor: '#27AE60', paddingHorizontal: 18, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  swiggyGreenCtaText: { color: '#FFF', fontSize: 14, fontWeight: '900' },

  adminFieldLabel: { fontSize: 11, fontWeight: '800', color: '#5D6D7E', marginBottom: 3, marginTop: 4, marginLeft: 2 },
  adminResMiniPill: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#EAEDED', borderRadius: 8, marginRight: 6, borderWidth: 1, borderColor: '#D5DBDB' },
  adminResMiniPillActive: { backgroundColor: '#2C3E50', borderColor: '#2C3E50' },
  vegRuleMiniButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#BDC3C7' },
  adminInspectorRowBlock: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EAEDED', flexDirection: 'row', alignItems: 'center', gap: 8 },
  adminInspectorDishSubline: { flexDirection: 'row', paddingLeft: 12, marginTop: 4, alignItems: 'center' },
  adminResDeleteIconButton: { backgroundColor: '#C0392B', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  
  // High Fidelity User Database Logs Pipeline Components
  userDataCardPipelineRow: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EAEDED', marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  userDataBadgeCounter: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#3498DB', justifyContent: 'center', alignItems: 'center' }
});

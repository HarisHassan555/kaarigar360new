// Script to create additional worker profiles
const { initializeFirebase, getFirebaseServices } = require('./firebaseInit');

const additionalWorkers = [
  // Additional Plumbers (2 more)
  {
    firstName: 'Kamran',
    lastName: 'Shah',
    email: 'kamran.plumber2@example.com',
    password: 'password123',
    phoneNumber: '+92 310 1234567',
    address: 'Nazimabad, Karachi',
    role: 'worker',
    skills: ['Plumber', 'Sewer Cleaning', 'Emergency Repairs'],
    description: 'Emergency plumber available 24/7. Specializes in sewer cleaning and urgent repairs. 7 years experience.',
    experienceYears: 7,
    hourlyRate: 900,
    cnic: '42101-1111111-1',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Kamran+Plumber'
  },
  {
    firstName: 'Nadia',
    lastName: 'Qureshi',
    email: 'nadia.plumber2@example.com',
    password: 'password123',
    phoneNumber: '+92 311 2345678',
    address: 'Federal B Area, Karachi',
    role: 'worker',
    skills: ['Plumber', 'Water Tank Cleaning', 'Leak Detection'],
    description: 'Specialist in water tank cleaning and leak detection. Provides thorough maintenance services. 4 years experience.',
    experienceYears: 4,
    hourlyRate: 750,
    cnic: '42101-2222222-2',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Nadia+Plumber'
  },

  // Additional Carpenters (2 more)
  {
    firstName: 'Rashid',
    lastName: 'Ahmed',
    email: 'rashid.carpenter2@example.com',
    password: 'password123',
    phoneNumber: '+92 312 3456789',
    address: 'Liaquatabad, Karachi',
    role: 'worker',
    skills: ['Carpenter', 'Kitchen Cabinets', 'Door Installation'],
    description: 'Expert in kitchen cabinet installation and custom door fittings. Precision work guaranteed. 6 years experience.',
    experienceYears: 6,
    hourlyRate: 850,
    cnic: '42101-3333333-3',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Rashid+Carpenter'
  },
  {
    firstName: 'Amna',
    lastName: 'Khan',
    email: 'amna.carpenter2@example.com',
    password: 'password123',
    phoneNumber: '+92 313 4567890',
    address: 'Gulberg, Karachi',
    role: 'worker',
    skills: ['Carpenter', 'Wardrobe Design', 'Space Optimization'],
    description: 'Creative carpenter specializing in wardrobe design and space optimization solutions. 5 years experience.',
    experienceYears: 5,
    hourlyRate: 800,
    cnic: '42101-4444444-4',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Amna+Carpenter'
  },

  // Additional Electricians (2 more)
  {
    firstName: 'Imran',
    lastName: 'Hussain',
    email: 'imran.electrician2@example.com',
    password: 'password123',
    phoneNumber: '+92 314 5678901',
    address: 'Shah Faisal Colony, Karachi',
    role: 'worker',
    skills: ['Electrician', 'Solar Panel Installation', 'Energy Auditing'],
    description: 'Solar panel installation expert and energy auditor. Helps reduce electricity costs. 8 years experience.',
    experienceYears: 8,
    hourlyRate: 950,
    cnic: '42101-5555555-5',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Imran+Electrician'
  },
  {
    firstName: 'Sana',
    lastName: 'Malik',
    email: 'sana.electrician2@example.com',
    password: 'password123',
    phoneNumber: '+92 315 6789012',
    address: 'Malir Cantt, Karachi',
    role: 'worker',
    skills: ['Electrician', 'Home Automation', 'Security Systems'],
    description: 'Smart home automation and security system installer. Modern technology solutions. 4 years experience.',
    experienceYears: 4,
    hourlyRate: 850,
    cnic: '42101-6666666-6',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Sana+Electrician'
  },

  // Additional Painters (2 more)
  {
    firstName: 'Fahad',
    lastName: 'Riaz',
    email: 'fahad.painter2@example.com',
    password: 'password123',
    phoneNumber: '+92 316 7890123',
    address: 'Bahadurabad, Karachi',
    role: 'worker',
    skills: ['Painter', 'Texture Painting', 'Commercial Painting'],
    description: 'Commercial painter specializing in texture finishes and large-scale projects. 9 years experience.',
    experienceYears: 9,
    hourlyRate: 700,
    cnic: '42101-7777777-7',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Fahad+Painter'
  },
  {
    firstName: 'Hina',
    lastName: 'Akhtar',
    email: 'hina.painter2@example.com',
    password: 'password123',
    phoneNumber: '+92 317 8901234',
    address: 'Tariq Road, Karachi',
    role: 'worker',
    skills: ['Painter', 'Wall Art', 'Children Room Design'],
    description: 'Creative painter specializing in wall art and children\'s room designs. Makes spaces beautiful. 3 years experience.',
    experienceYears: 3,
    hourlyRate: 650,
    cnic: '42101-8888888-8',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Hina+Painter'
  },

  // Additional Masons (2 more)
  {
    firstName: 'Danish',
    lastName: 'Siddiqui',
    email: 'danish.mason2@example.com',
    password: 'password123',
    phoneNumber: '+92 318 9012345',
    address: 'Landhi, Karachi',
    role: 'worker',
    skills: ['Mason', 'Foundation Work', 'Retaining Walls'],
    description: 'Foundation specialist and retaining wall expert. Strong construction background. 10 years experience.',
    experienceYears: 10,
    hourlyRate: 800,
    cnic: '42101-9999999-9',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Danish+Mason'
  },
  {
    firstName: 'Rabia',
    lastName: 'Nawaz',
    email: 'rabia.mason2@example.com',
    password: 'password123',
    phoneNumber: '+92 319 0123456',
    address: 'Korangi Industrial Area, Karachi',
    role: 'worker',
    skills: ['Mason', 'Tile Installation', 'Marble Work'],
    description: 'Tile and marble installation specialist. Precision work for floors and walls. 6 years experience.',
    experienceYears: 6,
    hourlyRate: 750,
    cnic: '42101-1010101-0',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Rabia+Mason'
  }
];

async function createMoreWorkers() {
  console.log('🚀 Creating additional worker profiles...\n');

  try {
    // Initialize Firebase
    const { auth, db } = await getFirebaseServices();

    for (let i = 0; i < additionalWorkers.length; i++) {
      const worker = additionalWorkers[i];
      console.log(`Creating worker ${i + 1}/${additionalWorkers.length}: ${worker.firstName} ${worker.lastName}`);

      try {
        // Create user account in Firebase Auth and Firestore
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const { doc, setDoc } = require('firebase/firestore');

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, worker.email, worker.password);

        // Create user document in Firestore
        const userData = {
          uid: userCredential.user.uid,
          email: worker.email,
          phoneNumber: worker.phoneNumber,
          role: worker.role,
          profile: {
            firstName: worker.firstName,
            lastName: worker.lastName,
            fullName: `${worker.firstName} ${worker.lastName}`,
            address: worker.address,
            cnic: worker.cnic,
            cnicVerified: true,
            cnicPhotos: {
              front: worker.cnicFrontPhoto,
              back: worker.cnicBackPhoto
            },
            skills: worker.skills,
            rating: 4.0 + Math.random() * 1.0, // Random rating between 4.0-5.0
            description: worker.description,
            experienceYears: worker.experienceYears,
            hourlyRate: worker.hourlyRate,
            profilePicture: worker.profilePicture
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', userCredential.user.uid), userData);

        console.log(`✅ Created: ${worker.firstName} ${worker.lastName} (${worker.skills.join(', ')})`);

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`⚠️  User already exists: ${worker.firstName} ${worker.lastName}`);
        } else {
          console.error(`❌ Error creating ${worker.firstName} ${worker.lastName}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Additional workers created successfully!');
    console.log('\n📊 Summary:');
    console.log(`✅ Created ${additionalWorkers.length} additional worker profiles`);
    console.log('🏷️  Skills covered: Plumber, Carpenter, Electrician, Painter, Mason');
    console.log('👥 Additional profiles per skill: 2');

    console.log('\n🔧 Next steps:');
    console.log('1. Start the app: npm start');
    console.log('2. Login as employer to see all available workers (20 total)');
    console.log('3. Test advanced worker search and filtering');

  } catch (error) {
    console.error('\n❌ Error initializing Firebase:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Firebase security rules are deployed');
    console.log('2. You are authenticated with Firebase CLI (if using deployment script)');
  }
}

// Run the script
createMoreWorkers().catch(console.error);

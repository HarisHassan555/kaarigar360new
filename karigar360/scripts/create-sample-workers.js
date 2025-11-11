// Script to create sample worker profiles
const { initializeFirebase, getFirebaseServices } = require('./firebaseInit');

const sampleWorkers = [
  // Plumbers (2 profiles)
  {
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.plumber@example.com',
    password: 'password123',
    phoneNumber: '+92 300 1234567',
    address: 'Gulshan-e-Iqbal, Karachi',
    role: 'worker',
    skills: ['Plumber', 'Pipe Fitting', 'Drainage'],
    description: 'Experienced plumber with 5+ years in residential and commercial plumbing. Specializes in pipe fitting and drainage systems.',
    experienceYears: 5,
    hourlyRate: 800,
    cnic: '42101-1234567-8',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Ahmed+Plumber'
  },
  {
    firstName: 'Fatima',
    lastName: 'Ahmed',
    email: 'fatima.plumber@example.com',
    password: 'password123',
    phoneNumber: '+92 301 2345678',
    address: 'Defence, Karachi',
    role: 'worker',
    skills: ['Plumber', 'Bathroom Renovation', 'Water Heater'],
    description: 'Female plumber specializing in bathroom renovations and water heater installations. 3 years experience.',
    experienceYears: 3,
    hourlyRate: 700,
    cnic: '42101-2345678-9',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Fatima+Plumber'
  },

  // Carpenters (2 profiles)
  {
    firstName: 'Usman',
    lastName: 'Ali',
    email: 'usman.carpenter@example.com',
    password: 'password123',
    phoneNumber: '+92 302 3456789',
    address: 'Saddar, Karachi',
    role: 'worker',
    skills: ['Carpenter', 'Furniture Making', 'Wood Work'],
    description: 'Master carpenter with 8+ years experience in custom furniture making and wood work. Specializes in home furniture.',
    experienceYears: 8,
    hourlyRate: 900,
    cnic: '42101-3456789-0',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Usman+Carpenter'
  },
  {
    firstName: 'Sara',
    lastName: 'Khan',
    email: 'sara.carpenter@example.com',
    password: 'password123',
    phoneNumber: '+92 303 4567890',
    address: 'Clifton, Karachi',
    role: 'worker',
    skills: ['Carpenter', 'Interior Design', 'Custom Cabinets'],
    description: 'Creative carpenter specializing in interior design and custom cabinet making. 4 years experience in modern designs.',
    experienceYears: 4,
    hourlyRate: 850,
    cnic: '42101-4567890-1',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Sara+Carpenter'
  },

  // Electricians (2 profiles)
  {
    firstName: 'Hassan',
    lastName: 'Raza',
    email: 'hassan.electrician@example.com',
    password: 'password123',
    phoneNumber: '+92 304 5678901',
    address: 'PECHS, Karachi',
    role: 'worker',
    skills: ['Electrician', 'Wiring', 'Generator Installation'],
    description: 'Licensed electrician with 6+ years experience in residential and commercial wiring. Specializes in generator installations.',
    experienceYears: 6,
    hourlyRate: 750,
    cnic: '42101-5678901-2',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Hassan+Electrician'
  },
  {
    firstName: 'Ayesha',
    lastName: 'Bibi',
    email: 'ayesha.electrician@example.com',
    password: 'password123',
    phoneNumber: '+92 305 6789012',
    address: 'North Karachi',
    role: 'worker',
    skills: ['Electrician', 'Appliance Repair', 'Smart Home'],
    description: 'Female electrician specializing in appliance repair and smart home installations. 4 years experience.',
    experienceYears: 4,
    hourlyRate: 700,
    cnic: '42101-6789012-3',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Ayesha+Electrician'
  },

  // Painters (2 profiles)
  {
    firstName: 'Omar',
    lastName: 'Farooq',
    email: 'omar.painter@example.com',
    password: 'password123',
    phoneNumber: '+92 306 7890123',
    address: 'Malir, Karachi',
    role: 'worker',
    skills: ['Painter', 'Wall Painting', 'Decorative Painting'],
    description: 'Professional painter with 7+ years experience in residential and commercial painting. Specializes in decorative finishes.',
    experienceYears: 7,
    hourlyRate: 600,
    cnic: '42101-7890123-4',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Omar+Painter'
  },
  {
    firstName: 'Zahra',
    lastName: 'Hassan',
    email: 'zahra.painter@example.com',
    password: 'password123',
    phoneNumber: '+92 307 8901234',
    address: 'Gulistan-e-Johar, Karachi',
    role: 'worker',
    skills: ['Painter', 'Interior Painting', 'Color Consultation'],
    description: 'Interior painter specializing in color consultation and modern painting techniques. 5 years experience.',
    experienceYears: 5,
    hourlyRate: 650,
    cnic: '42101-8901234-5',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Zahra+Painter'
  },

  // Masons (2 profiles)
  {
    firstName: 'Bilal',
    lastName: 'Ahmed',
    email: 'bilal.mason@example.com',
    password: 'password123',
    phoneNumber: '+92 308 9012345',
    address: 'Orangi Town, Karachi',
    role: 'worker',
    skills: ['Mason', 'Brick Laying', 'Tile Work'],
    description: 'Experienced mason with 9+ years in brick laying and tile work. Specializes in construction and renovation projects.',
    experienceYears: 9,
    hourlyRate: 700,
    cnic: '42101-9012345-6',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Bilal+Mason'
  },
  {
    firstName: 'Maryam',
    lastName: 'Khan',
    email: 'maryam.mason@example.com',
    password: 'password123',
    phoneNumber: '+92 309 0123456',
    address: 'Korangi, Karachi',
    role: 'worker',
    skills: ['Mason', 'Stone Work', 'Restoration'],
    description: 'Mason specializing in stone work and historical building restoration. 6 years experience in heritage projects.',
    experienceYears: 6,
    hourlyRate: 800,
    cnic: '42101-0123456-7',
    cnicFrontPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Front',
    cnicBackPhoto: 'https://via.placeholder.com/400x250?text=CNIC+Back',
    profilePicture: 'https://via.placeholder.com/200x200?text=Maryam+Mason'
  }
];

async function createSampleWorkers() {
  console.log('🚀 Creating sample worker profiles...\n');

  try {
    // Initialize Firebase
    const { auth, db } = await getFirebaseServices();

    for (let i = 0; i < sampleWorkers.length; i++) {
      const worker = sampleWorkers[i];
      console.log(`Creating worker ${i + 1}/${sampleWorkers.length}: ${worker.firstName} ${worker.lastName}`);

      try {
        // Create user account in Firebase Auth and Firestore
        const { createUserWithEmailAndPassword } = require('firebase/auth');
        const { doc, setDoc } = require('firebase/firestore');

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, worker.email, worker.password);
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
            rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5-5.0
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

    console.log('\n🎉 Sample workers created successfully!');
    console.log('\n📊 Summary:');
    console.log(`✅ Created ${sampleWorkers.length} worker profiles`);
    console.log('🏷️  Skills covered: Plumber, Carpenter, Electrician, Painter, Mason');
    console.log('👥 Profiles per skill: 2');

    console.log('\n🔧 Next steps:');
    console.log('1. Start the app: npm start');
    console.log('2. Login as employer to see available workers');
    console.log('3. Test worker search and booking functionality');

  } catch (error) {
    console.error('\n❌ Error initializing Firebase:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Firebase security rules are deployed');
    console.log('2. You are authenticated with Firebase CLI (if using deployment script)');
  }
}

// Run the script
createSampleWorkers().catch(console.error);

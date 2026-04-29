require('dotenv').config();
const mongoose = require('mongoose');
const Lead = require('./src/models/Lead');

const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat'];
const services = ['Web Development', 'Mobile App', 'SEO', 'Digital Marketing', 'UI/UX Design', 'Cloud Services', 'Consulting', 'Other'];
const statuses = ['New', 'Interested', 'Converted', 'Rejected'];
const names = ['Aarav Sharma', 'Priya Patel', 'Rahul Kumar', 'Sneha Joshi', 'Vikram Singh', 'Ananya Gupta', 'Rohan Mehta', 'Kavya Reddy', 'Arjun Nair', 'Pooja Shah', 'Kiran Bose', 'Neha Verma', 'Siddharth Rao', 'Deepika Iyer', 'Manish Agarwal', 'Shruti Pillai', 'Akash Chandra', 'Riya Malhotra', 'Suresh Yadav', 'Nisha Kapoor'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  return d;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lead_dashboard');
  await Lead.deleteMany({});

  const leads = Array.from({ length: 60 }, (_, i) => {
    const name = rand(names);
    const email = name.toLowerCase().replace(/\s+/g, '.') + (i + 1) + '@example.com';
    return {
      name,
      mobile: `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`,
      email,
      city: rand(cities),
      service: rand(services),
      budget: randInt(10, 500) * 1000,
      status: rand(statuses),
      notes: Math.random() > 0.6 ? 'Follow up required' : undefined,
      createdAt: randDate(180),
    };
  });

  await Lead.insertMany(leads);
  console.log(`✅ Seeded ${leads.length} leads`);
  await mongoose.disconnect();
}

seed().catch(console.error);

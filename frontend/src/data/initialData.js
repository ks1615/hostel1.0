export const INITIAL_ROOMS = [
  {
    id: 'room_101',
    number: '101',
    block: 'Block A',
    floor: 1,
    type: 'Double Shared',
    capacity: 2,
    rent: 7500,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser', 'Balcony'],
    status: 'Full',
    beds: [
      { bedNo: 1, residentId: 'res_101' },
      { bedNo: 2, residentId: 'res_102' }
    ],
    notes: 'Ground floor corner room with garden view.'
  },
  {
    id: 'room_102',
    number: '102',
    block: 'Block A',
    floor: 1,
    type: 'Single Deluxe',
    capacity: 1,
    rent: 12000,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser', 'Refrigerator', 'Smart TV'],
    status: 'Occupied',
    beds: [
      { bedNo: 1, residentId: 'res_103' }
    ],
    notes: 'Premium single room for postgraduate researchers.'
  },
  {
    id: 'room_103',
    number: '103',
    block: 'Block A',
    floor: 1,
    type: 'Triple Shared',
    capacity: 3,
    rent: 5500,
    isAC: false,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'Ceiling Fan', 'Geyser'],
    status: 'Occupied',
    beds: [
      { bedNo: 1, residentId: 'res_104' },
      { bedNo: 2, residentId: 'res_105' },
      { bedNo: 3, residentId: null }
    ],
    notes: 'Spacious triple room, 1 bed vacant.'
  },
  {
    id: 'room_104',
    number: '104',
    block: 'Block A',
    floor: 1,
    type: 'Double Shared',
    capacity: 2,
    rent: 7000,
    isAC: false,
    attachedBath: false,
    amenities: ['WiFi', 'Study Desk', 'Ceiling Fan'],
    status: 'Available',
    beds: [
      { bedNo: 1, residentId: null },
      { bedNo: 2, residentId: null }
    ],
    notes: 'Freshly painted, ready for immediate occupancy.'
  },
  {
    id: 'room_201',
    number: '201',
    block: 'Block A',
    floor: 2,
    type: 'Double Shared',
    capacity: 2,
    rent: 8000,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser', 'Balcony'],
    status: 'Full',
    beds: [
      { bedNo: 1, residentId: 'res_106' },
      { bedNo: 2, residentId: 'res_107' }
    ],
    notes: 'Second floor facing main hostel courtyard.'
  },
  {
    id: 'room_202',
    number: '202',
    block: 'Block A',
    floor: 2,
    type: 'Single Deluxe',
    capacity: 1,
    rent: 12500,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser', 'Balcony'],
    status: 'Maintenance',
    beds: [
      { bedNo: 1, residentId: null }
    ],
    notes: 'AC servicing and bathroom tile repair underway.'
  },
  {
    id: 'room_203',
    number: '203',
    block: 'Block A',
    floor: 2,
    type: 'Triple Shared',
    capacity: 3,
    rent: 6000,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser'],
    status: 'Full',
    beds: [
      { bedNo: 1, residentId: 'res_108' },
      { bedNo: 2, residentId: 'res_109' },
      { bedNo: 3, residentId: 'res_110' }
    ],
    notes: 'Fully occupied by engineering final year students.'
  },
  {
    id: 'room_301',
    number: '301',
    block: 'Block B',
    floor: 3,
    type: 'Executive Suite',
    capacity: 2,
    rent: 14000,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser', 'Balcony', 'Mini Fridge', 'Sofa'],
    status: 'Occupied',
    beds: [
      { bedNo: 1, residentId: 'res_111' },
      { bedNo: 2, residentId: null }
    ],
    notes: 'Top floor luxury suite with panoramic city skyline view.'
  },
  {
    id: 'room_302',
    number: '302',
    block: 'Block B',
    floor: 3,
    type: 'Double Shared',
    capacity: 2,
    rent: 7500,
    isAC: true,
    attachedBath: true,
    amenities: ['WiFi', 'Study Desk', 'AC', 'Geyser'],
    status: 'Available',
    beds: [
      { bedNo: 1, residentId: null },
      { bedNo: 2, residentId: null }
    ],
    notes: 'Quiet study floor room.'
  }
];

export const INITIAL_RESIDENTS = [
  {
    id: 'res_101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    guardianName: 'Rajesh Sharma',
    guardianPhone: '+91 98765 11111',
    roomId: 'room_101',
    roomNumber: '101',
    bedNo: 1,
    checkInDate: '2026-01-10',
    rentStatus: 'Paid',
    monthlyRent: 7500,
    securityDeposit: 15000,
    idProof: 'Aadhaar 4532-8890-1122'
  },
  {
    id: 'res_102',
    name: 'Rohan Patel',
    email: 'rohan.patel@example.com',
    phone: '+91 98123 45678',
    guardianName: 'Suresh Patel',
    guardianPhone: '+91 98123 99999',
    roomId: 'room_101',
    roomNumber: '101',
    bedNo: 2,
    checkInDate: '2026-01-12',
    rentStatus: 'Paid',
    monthlyRent: 7500,
    securityDeposit: 15000,
    idProof: 'Passport Z881920'
  },
  {
    id: 'res_103',
    name: 'Vikramaditya Roy',
    email: 'vikram.roy@example.com',
    phone: '+91 97654 32109',
    guardianName: 'Anindya Roy',
    guardianPhone: '+91 97654 88888',
    roomId: 'room_102',
    roomNumber: '102',
    bedNo: 1,
    checkInDate: '2026-02-01',
    rentStatus: 'Paid',
    monthlyRent: 12000,
    securityDeposit: 24000,
    idProof: 'Aadhaar 9912-3344-5566'
  },
  {
    id: 'res_104',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 96543 21098',
    guardianName: 'Venugopal Nair',
    guardianPhone: '+91 96543 77777',
    roomId: 'room_103',
    roomNumber: '103',
    bedNo: 1,
    checkInDate: '2026-03-05',
    rentStatus: 'Pending',
    monthlyRent: 5500,
    securityDeposit: 11000,
    idProof: 'Aadhaar 1122-3344-5566'
  },
  {
    id: 'res_105',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@example.com',
    phone: '+91 95432 10987',
    guardianName: 'Sunil Gupta',
    guardianPhone: '+91 95432 66666',
    roomId: 'room_103',
    roomNumber: '103',
    bedNo: 2,
    checkInDate: '2026-03-10',
    rentStatus: 'Paid',
    monthlyRent: 5500,
    securityDeposit: 11000,
    idProof: 'Voter ID ABC1234567'
  },
  {
    id: 'res_106',
    name: 'Karthik Subbaraj',
    email: 'karthik.s@example.com',
    phone: '+91 94321 09876',
    guardianName: 'Subbaraj M',
    guardianPhone: '+91 94321 55555',
    roomId: 'room_201',
    roomNumber: '201',
    bedNo: 1,
    checkInDate: '2026-02-15',
    rentStatus: 'Paid',
    monthlyRent: 8000,
    securityDeposit: 16000,
    idProof: 'Aadhaar 7788-9900-1122'
  },
  {
    id: 'res_107',
    name: 'Devansh Verma',
    email: 'dev.verma@example.com',
    phone: '+91 93210 98765',
    guardianName: 'Alok Verma',
    guardianPhone: '+91 93210 44444',
    roomId: 'room_201',
    roomNumber: '201',
    bedNo: 2,
    checkInDate: '2026-02-18',
    rentStatus: 'Overdue',
    monthlyRent: 8000,
    securityDeposit: 16000,
    idProof: 'Driving License DL-04202100'
  },
  {
    id: 'res_108',
    name: 'Siddharth Mehta',
    email: 'sid.mehta@example.com',
    phone: '+91 92109 87654',
    guardianName: 'Hemant Mehta',
    guardianPhone: '+91 92109 33333',
    roomId: 'room_203',
    roomNumber: '203',
    bedNo: 1,
    checkInDate: '2026-01-20',
    rentStatus: 'Paid',
    monthlyRent: 6000,
    securityDeposit: 12000,
    idProof: 'Aadhaar 3344-5566-7788'
  },
  {
    id: 'res_109',
    name: 'Kabir Singh',
    email: 'kabir.singh@example.com',
    phone: '+91 91098 76543',
    guardianName: 'Harpreet Singh',
    guardianPhone: '+91 91098 22222',
    roomId: 'room_203',
    roomNumber: '203',
    bedNo: 2,
    checkInDate: '2026-01-22',
    rentStatus: 'Paid',
    monthlyRent: 6000,
    securityDeposit: 12000,
    idProof: 'Aadhaar 5566-7788-9900'
  },
  {
    id: 'res_110',
    name: 'Tushar Deshmukh',
    email: 'tushar.d@example.com',
    phone: '+91 90987 65432',
    guardianName: 'Prakash Deshmukh',
    guardianPhone: '+91 90987 11111',
    roomId: 'room_203',
    roomNumber: '203',
    bedNo: 3,
    checkInDate: '2026-01-25',
    rentStatus: 'Paid',
    monthlyRent: 6000,
    securityDeposit: 12000,
    idProof: 'Aadhaar 2233-4455-6677'
  },
  {
    id: 'res_111',
    name: 'Ishaan Malhotra',
    email: 'ishaan.m@example.com',
    phone: '+91 89876 54321',
    guardianName: 'Vikram Malhotra',
    guardianPhone: '+91 89876 00000',
    roomId: 'room_301',
    roomNumber: '301',
    bedNo: 1,
    checkInDate: '2026-04-01',
    rentStatus: 'Paid',
    monthlyRent: 14000,
    securityDeposit: 28000,
    idProof: 'Passport P9948210'
  }
];

export const INITIAL_UPI_CONFIG = {
  upiId: 'sakhareplot@upi',
  payeeName: 'Sakhare Plot Hostel',
  notePrefix: 'Rent Payment'
};

export const INITIAL_PAYMENTS = [
  {
    id: 'pay_1001',
    residentId: 'res_101',
    residentName: 'Aarav Sharma',
    roomNumber: '101',
    amount: 7500,
    date: '2026-10-01',
    month: 'October 2026',
    paymentMethod: 'UPI',
    upiRefNo: '428910283412',
    status: 'Completed',
    receiptNo: 'REC-2026-1001'
  },
  {
    id: 'pay_1002',
    residentId: 'res_102',
    residentName: 'Rohan Patel',
    roomNumber: '101',
    amount: 7500,
    date: '2026-10-02',
    month: 'October 2026',
    paymentMethod: 'Bank Transfer',
    upiRefNo: 'N/A',
    status: 'Completed',
    receiptNo: 'REC-2026-1002'
  }
];

export const INITIAL_NOTICES = [
  {
    id: 'notice_1',
    title: 'Hostel Main Gate Timings & Security Notice',
    content: 'All residents of Sakhare Plot Hostel are requested to enter the premises by 10:00 PM. Late entry requires prior approval.',
    category: 'Urgent',
    date: '2026-10-05',
    isPinned: true,
    author: 'Hostel Management'
  },
  {
    id: 'notice_2',
    title: 'Monthly Rent Payment Due Reminder',
    content: 'Rent for October 2026 is due by the 10th of this month. Please pay via UPI QR Scanner or in the fee section.',
    category: 'General',
    date: '2026-10-01',
    isPinned: true,
    author: 'Accounts Office'
  }
];

export const INITIAL_MAINTENANCE = [
  {
    id: 'maint_501',
    roomId: 'room_202',
    roomNumber: '202',
    issue: 'Air conditioner cooling coil leaked water, requires gas refill & coil replace.',
    category: 'AC / Appliance',
    priority: 'High',
    status: 'In Progress',
    reportedDate: '2026-10-04'
  }
];

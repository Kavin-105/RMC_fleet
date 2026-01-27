// Mock data for development
// This will be replaced with API calls later

export const mockVehicles = [
    {
        id: '1',
        vehicleNumber: 'MH-12-AB-1234',
        chassisNumber: 'TCM202312345',
        model: 'Schwing Stetter AM 6',
        manufacturingYear: 2022,
        fuelType: 'Diesel',
        drumCapacity: 6,
        registrationDate: '2022-03-15',
        currentOdometer: 45680,
        engineHours: 2340,
        assignedDriver: '1',
        status: 'Active'
    },
    {
        id: '2',
        vehicleNumber: 'MH-12-CD-5678',
        chassisNumber: 'TCM202312346',
        model: 'Schwing Stetter AM 9',
        manufacturingYear: 2021,
        fuelType: 'Diesel',
        drumCapacity: 9,
        registrationDate: '2021-08-20',
        currentOdometer: 78920,
        engineHours: 4120,
        assignedDriver: '2',
        status: 'Active'
    },
    {
        id: '3',
        vehicleNumber: 'MH-12-EF-9012',
        chassisNumber: 'TCM202312347',
        model: 'Schwing Stetter AM 7',
        manufacturingYear: 2023,
        fuelType: 'Diesel',
        drumCapacity: 7,
        registrationDate: '2023-01-10',
        currentOdometer: 12450,
        engineHours: 890,
        assignedDriver: '3',
        status: 'Maintenance'
    },
    {
        id: '4',
        vehicleNumber: 'MH-12-GH-3456',
        chassisNumber: 'TCM202312348',
        model: 'Ajax Fiori ARGO 2000',
        manufacturingYear: 2022,
        fuelType: 'Diesel',
        drumCapacity: 4,
        registrationDate: '2022-06-25',
        currentOdometer: 34560,
        engineHours: 1780,
        assignedDriver: null,
        status: 'Active'
    },
    {
        id: '5',
        vehicleNumber: 'MH-12-IJ-7890',
        chassisNumber: 'TCM202312349',
        model: 'Schwing Stetter AM 12',
        manufacturingYear: 2020,
        fuelType: 'Diesel',
        drumCapacity: 12,
        registrationDate: '2020-11-15',
        currentOdometer: 98760,
        engineHours: 5230,
        assignedDriver: '4',
        status: 'Active'
    }
];

export const mockDrivers = [
    {
        id: '1',
        name: 'Rajesh Kumar',
        mobile: '9876543210',
        licenseNumber: 'MH-1220220045678',
        licenseExpiry: '2026-05-15',
        assignedVehicles: ['1'],
        status: 'Active',
        checklistCompliance: 95
    },
    {
        id: '2',
        name: 'Suresh Patil',
        mobile: '9876543211',
        licenseNumber: 'MH-1420210034567',
        licenseExpiry: '2025-08-20',
        assignedVehicles: ['2'],
        status: 'Active',
        checklistCompliance: 88
    },
    {
        id: '3',
        name: 'Mahesh Sharma',
        mobile: '9876543212',
        licenseNumber: 'MH-1220230056789',
        licenseExpiry: '2027-01-10',
        assignedVehicles: ['3'],
        status: 'Active',
        checklistCompliance: 100
    },
    {
        id: '4',
        name: 'Ganesh More',
        mobile: '9876543213',
        licenseNumber: 'MH-1220190023456',
        licenseExpiry: '2024-12-25',
        assignedVehicles: ['5'],
        status: 'Inactive',
        checklistCompliance: 72
    },
    {
        id: '5',
        name: 'Prakash Jadhav',
        mobile: '9876543214',
        licenseNumber: 'MH-1220210067890',
        licenseExpiry: '2026-03-18',
        assignedVehicles: [],
        status: 'Active',
        checklistCompliance: 92
    }
];

export const mockDocuments = [
    {
        id: '1',
        vehicleId: '1',
        type: 'RC Book',
        fileUrl: '/documents/rc_1.pdf',
        expiryDate: '2027-03-15',
        uploadedAt: '2022-03-15',
        status: 'Valid'
    },
    {
        id: '2',
        vehicleId: '1',
        type: 'Insurance',
        fileUrl: '/documents/insurance_1.pdf',
        expiryDate: '2026-02-15',
        uploadedAt: '2025-02-15',
        status: 'Expiring'
    },
    {
        id: '3',
        vehicleId: '1',
        type: 'Fitness',
        fileUrl: '/documents/fitness_1.pdf',
        expiryDate: '2025-12-31',
        uploadedAt: '2024-01-01',
        status: 'Expired'
    },
    {
        id: '4',
        vehicleId: '2',
        type: 'RC Book',
        fileUrl: '/documents/rc_2.pdf',
        expiryDate: '2026-08-20',
        uploadedAt: '2021-08-20',
        status: 'Valid'
    },
    {
        id: '5',
        vehicleId: '2',
        type: 'Insurance',
        fileUrl: '/documents/insurance_2.pdf',
        expiryDate: '2026-08-20',
        uploadedAt: '2025-08-20',
        status: 'Valid'
    },
    {
        id: '6',
        vehicleId: '3',
        type: 'Permit',
        fileUrl: '/documents/permit_3.pdf',
        expiryDate: '2026-01-10',
        uploadedAt: '2023-01-10',
        status: 'Expiring'
    }
];

export const mockExpenses = [
    {
        id: '1',
        vehicleId: '1',
        driverId: '1',
        type: 'Fuel',
        amount: 5500,
        description: 'Diesel refill at HP Petrol Pump',
        billPhoto: null,
        date: '2026-01-27',
        location: { lat: 18.5204, lng: 73.8567 },
        status: 'Pending'
    },
    {
        id: '2',
        vehicleId: '1',
        driverId: '1',
        type: 'Toll',
        amount: 350,
        description: 'Mumbai-Pune Expressway toll',
        billPhoto: null,
        date: '2026-01-26',
        location: { lat: 18.7632, lng: 73.4089 },
        status: 'Approved'
    },
    {
        id: '3',
        vehicleId: '2',
        driverId: '2',
        type: 'Maintenance',
        amount: 12500,
        description: 'Brake pad replacement',
        billPhoto: null,
        date: '2026-01-25',
        location: { lat: 18.5204, lng: 73.8567 },
        status: 'Approved'
    },
    {
        id: '4',
        vehicleId: '3',
        driverId: '3',
        type: 'Spare Parts',
        amount: 8700,
        description: 'Hydraulic pump seal kit',
        billPhoto: null,
        date: '2026-01-24',
        location: { lat: 18.5204, lng: 73.8567 },
        status: 'Rejected'
    },
    {
        id: '5',
        vehicleId: '2',
        driverId: '2',
        type: 'Fuel',
        amount: 6200,
        description: 'Diesel refill',
        billPhoto: null,
        date: '2026-01-23',
        location: { lat: 18.5204, lng: 73.8567 },
        status: 'Pending'
    },
    {
        id: '6',
        vehicleId: '5',
        driverId: '4',
        type: 'Other',
        amount: 1500,
        description: 'Site parking charges',
        billPhoto: null,
        date: '2026-01-22',
        location: { lat: 18.5204, lng: 73.8567 },
        status: 'Approved'
    }
];

export const mockChecklists = [
    {
        id: '1',
        vehicleId: '1',
        driverId: '1',
        date: '2026-01-27',
        items: {
            engineOilLevel: true,
            brakeCheck: true,
            tyreCondition: true,
            drumRotation: true,
            waterSystem: true,
            lightsHorn: true
        },
        submittedAt: '2026-01-27T07:30:00',
        allChecked: true
    },
    {
        id: '2',
        vehicleId: '2',
        driverId: '2',
        date: '2026-01-27',
        items: {
            engineOilLevel: true,
            brakeCheck: true,
            tyreCondition: true,
            drumRotation: true,
            waterSystem: true,
            lightsHorn: true
        },
        submittedAt: '2026-01-27T08:15:00',
        allChecked: true
    }
];

// Helper functions
export function getVehicleById(id) {
    return mockVehicles.find(v => v.id === id);
}

export function getDriverById(id) {
    return mockDrivers.find(d => d.id === id);
}

export function getDriverForVehicle(vehicleId) {
    const vehicle = getVehicleById(vehicleId);
    if (vehicle?.assignedDriver) {
        return getDriverById(vehicle.assignedDriver);
    }
    return null;
}

export function getVehicleDocuments(vehicleId) {
    return mockDocuments.filter(d => d.vehicleId === vehicleId);
}

export function getVehicleExpenses(vehicleId) {
    return mockExpenses.filter(e => e.vehicleId === vehicleId);
}

export function getDriverExpenses(driverId) {
    return mockExpenses.filter(e => e.driverId === driverId);
}

export function getPendingExpenses() {
    return mockExpenses.filter(e => e.status === 'Pending');
}

export function getExpiringDocuments() {
    return mockDocuments.filter(d => d.status === 'Expiring' || d.status === 'Expired');
}

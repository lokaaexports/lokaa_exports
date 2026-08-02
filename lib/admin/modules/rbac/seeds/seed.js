"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = __importDefault(require("@/lib/prisma"));
var permission_service_js_1 = __importDefault(require("@/lib/admin/modules/rbac/services/permission.service.js"));
var bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Seed database with default roles, permissions, and data
 * Run: npx node -r dotenv/config lib/admin/modules/rbac/seeds/seed.js
 */
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var permissions, superAdminPerms, superAdminRole, adminPerms, adminRole, employeePerms, employeeRole, hashedPassword, superAdminUser, countries, _i, countries_1, country, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 14, 15, 17]);
                    // 1. Seed permissions
                    console.log('📋 Seeding permissions...');
                    return [4 /*yield*/, permission_service_js_1.default.seedDefaultPermissions()];
                case 2:
                    _a.sent();
                    console.log('✅ Permissions seeded');
                    // 2. Seed roles
                    console.log('👥 Seeding roles...');
                    return [4 /*yield*/, prisma_1.default.permission.findMany()
                        // Super Admin role - all permissions
                    ];
                case 3:
                    permissions = _a.sent();
                    superAdminPerms = permissions.filter(function (p) {
                        return ['rbac', 'super_admin'].includes(p.module);
                    });
                    return [4 /*yield*/, prisma_1.default.role.upsert({
                            where: { slug: 'super_admin' },
                            update: {
                                permissions: {
                                    set: superAdminPerms.map(function (p) { return ({ id: p.id }); }),
                                },
                            },
                            create: {
                                name: 'Super Admin',
                                slug: 'super_admin',
                                description: 'Highest authority - manages everything',
                                level: 0,
                                permissions: {
                                    connect: superAdminPerms.map(function (p) { return ({ id: p.id }); }),
                                },
                            },
                            include: { permissions: true },
                        })];
                case 4:
                    superAdminRole = _a.sent();
                    console.log('✅ Super Admin role created');
                    adminPerms = permissions.filter(function (p) { return p.module !== 'rbac'; });
                    return [4 /*yield*/, prisma_1.default.role.upsert({
                            where: { slug: 'admin' },
                            update: {
                                permissions: {
                                    set: adminPerms.map(function (p) { return ({ id: p.id }); }),
                                },
                            },
                            create: {
                                name: 'Admin',
                                slug: 'admin',
                                description: 'Daily operations manager - can create employees and manage most resources',
                                level: 1,
                                permissions: {
                                    connect: adminPerms.map(function (p) { return ({ id: p.id }); }),
                                },
                            },
                            include: { permissions: true },
                        })];
                case 5:
                    adminRole = _a.sent();
                    console.log('✅ Admin role created');
                    employeePerms = permissions.filter(function (p) {
                        var allowedModules = ['crm', 'rfqs', 'orders', 'products', 'analytics', 'tasks', 'notifications'];
                        var deniedActions = ['manage', 'delete'];
                        return allowedModules.includes(p.module) && !deniedActions.includes(p.action);
                    });
                    return [4 /*yield*/, prisma_1.default.role.upsert({
                            where: { slug: 'employee' },
                            update: {
                                permissions: {
                                    set: employeePerms.map(function (p) { return ({ id: p.id }); }),
                                },
                            },
                            create: {
                                name: 'Employee',
                                slug: 'employee',
                                description: 'Standard employee - limited access to assigned work',
                                level: 2,
                                permissions: {
                                    connect: employeePerms.map(function (p) { return ({ id: p.id }); }),
                                },
                            },
                            include: { permissions: true },
                        })];
                case 6:
                    employeeRole = _a.sent();
                    console.log('✅ Employee role created');
                    // 3. Seed default Super Admin user
                    console.log('👤 Seeding default Super Admin user...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('admin@lokaa123', 10)];
                case 7:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma_1.default.user.upsert({
                            where: { email: 'superadmin@lokaa.com' },
                            update: {},
                            create: {
                                email: 'superadmin@lokaa.com',
                                password: hashedPassword,
                                firstName: 'Super',
                                lastName: 'Admin',
                                phone: '+1234567890',
                                roleId: superAdminRole.id,
                                role: 0,
                                status: 'active',
                                companyId: 1
                            }
                        })];
                case 8:
                    superAdminUser = _a.sent();
                    console.log('✅ Super Admin user created (email: superadmin@lokaa.com)');
                    // 4. Seed default Company
                    console.log('🏢 Seeding company...');
                    return [4 /*yield*/, prisma_1.default.company.upsert({
                            where: { id: 1 },
                            update: {},
                            create: {
                                name: 'Lokaa Global Exports',
                                website: 'https://lokaa-global.com',
                                email: 'info@lokaa-global.com',
                                phone: '+91 9876543210',
                                address: 'Global Headquarters',
                                city: 'Mumbai',
                                country: 'India',
                                currency: 'USD'
                            }
                        })];
                case 9:
                    _a.sent();
                    console.log('✅ Company created');
                    // 5. Seed sample countries
                    console.log('🌍 Seeding countries...');
                    countries = [
                        { code: 'US', name: 'United States', region: 'North America' },
                        { code: 'GB', name: 'United Kingdom', region: 'Europe' },
                        { code: 'DE', name: 'Germany', region: 'Europe' },
                        { code: 'IN', name: 'India', region: 'Asia' },
                        { code: 'CN', name: 'China', region: 'Asia' },
                        { code: 'JP', name: 'Japan', region: 'Asia' },
                        { code: 'BR', name: 'Brazil', region: 'South America' },
                        { code: 'AU', name: 'Australia', region: 'Oceania' },
                    ];
                    _i = 0, countries_1 = countries;
                    _a.label = 10;
                case 10:
                    if (!(_i < countries_1.length)) return [3 /*break*/, 13];
                    country = countries_1[_i];
                    return [4 /*yield*/, prisma_1.default.country.upsert({
                            where: { code: country.code },
                            update: {},
                            create: country,
                        })];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    _i++;
                    return [3 /*break*/, 10];
                case 13:
                    console.log("\u2705 ".concat(countries.length, " countries seeded"));
                    console.log('\n✨ Database seeding completed successfully!');
                    console.log('\n📝 Default Users:');
                    console.log('  - Email: superadmin@lokaa.com');
                    console.log('  - Password: admin@lokaa123');
                    console.log('  - Role: Super Admin');
                    return [3 /*break*/, 17];
                case 14:
                    error_1 = _a.sent();
                    console.error('❌ Seeding failed:', error_1);
                    throw error_1;
                case 15: return [4 /*yield*/, prisma_1.default.$disconnect()];
                case 16:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 17: return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
});

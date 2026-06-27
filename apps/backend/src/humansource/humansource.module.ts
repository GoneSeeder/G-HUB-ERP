import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HumansourceEmployeesController } from './humansource-employees.controller';
import { HumansourceEmployeesService } from './humansource-employees.service';
import { HumansourceEmployeeTypesController } from './humansource-employee-types.controller';
import { HumansourceEmployeeTypesService } from './humansource-employee-types.service';
import { HumansourceJobLevelsController } from './humansource-job-levels.controller';
import { HumansourceJobLevelsService } from './humansource-job-levels.service';
import { HumansourcePositionsController } from './humansource-positions.controller';
import { HumansourcePositionsService } from './humansource-positions.service';
import { HumansourceShiftsController } from './humansource-shifts.controller';
import { HumansourceShiftsService } from './humansource-shifts.service';
import { HumansourceLeaveTypesController } from './humansource-leave-types.controller';
import { HumansourceLeaveTypesService } from './humansource-leave-types.service';
import { HumansourceApprovalController } from './humansource-approval.controller';
import { HumansourceApprovalService } from './humansource-approval.service';
import { HumansourcePayrollController } from './humansource-payroll.controller';
import { HumansourcePayrollService } from './humansource-payroll.service';
import { HumansourceAnnouncementsController } from './humansource-announcements.controller';
import { HumansourceAnnouncementsService } from './humansource-announcements.service';
import { HumansourceBasicSettingsController } from './humansource-basic-settings.controller';
import { HumansourceBasicSettingsService } from './humansource-basic-settings.service';
import { HumansourceOrgStructureController } from './humansource-org-structure.controller';
import { HumansourceOrgStructureService } from './humansource-org-structure.service';
import { HumansourceShiftAssignmentController } from './humansource-shift-assignment.controller';
import { HumansourceShiftAssignmentService } from './humansource-shift-assignment.service';
import { HumansourceAttendanceController } from './humansource-attendance.controller';
import { HumansourceAttendanceService } from './humansource-attendance.service';
import { HumansourceLeaveRuntimeController } from './humansource-leave-runtime.controller';
import { HumansourceLeaveRuntimeService } from './humansource-leave-runtime.service';
import { HumansourcePayrollRunController } from './humansource-payroll-run.controller';
import { HumansourcePayrollRunService } from './humansource-payroll-run.service';

@Module({
  imports: [PrismaModule],
  controllers: [
    HumansourceEmployeesController,
    HumansourceEmployeeTypesController,
    HumansourceJobLevelsController,
    HumansourcePositionsController,
    HumansourceShiftsController,
    HumansourceLeaveTypesController,
    HumansourceApprovalController,
    HumansourcePayrollController,
    HumansourceAnnouncementsController,
    HumansourceBasicSettingsController,
    HumansourceOrgStructureController,
    HumansourceShiftAssignmentController,
    HumansourceAttendanceController,
    HumansourceLeaveRuntimeController,
    HumansourcePayrollRunController,
  ],
  providers: [
    HumansourceEmployeesService,
    HumansourceEmployeeTypesService,
    HumansourceJobLevelsService,
    HumansourcePositionsService,
    HumansourceShiftsService,
    HumansourceLeaveTypesService,
    HumansourceApprovalService,
    HumansourcePayrollService,
    HumansourceAnnouncementsService,
    HumansourceBasicSettingsService,
    HumansourceOrgStructureService,
    HumansourceShiftAssignmentService,
    HumansourceAttendanceService,
    HumansourceLeaveRuntimeService,
    HumansourcePayrollRunService,
  ],
})
export class HumansourceModule {}

import { Component, ViewEncapsulation, ViewChild } from '@angular/core';
import { workData, customerList } from './datasource';
import { extend, closest, remove, addClass } from '@syncfusion/ej2-base';
import {
    EventSettingsModel, View, GroupModel, TimelineViewsService, TimelineMonthService,
    ResizeService, WorkHoursModel, DragAndDropService, ResourceDetails, ScheduleComponent, ActionEventArgs, CellClickEventArgs
} from '@syncfusion/ej2-angular-schedule';
import { DragAndDropEventArgs } from '@syncfusion/ej2-navigations';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
    @ViewChild('scheduleObj')
    public scheduleObj: ScheduleComponent;
    @ViewChild('treeObj')
    public treeObj: TreeViewComponent;

    public isTreeItemDropped: boolean = false;
    public draggedItemId: string = '';
    public currentView: View = 'TimelineDay';
    public workHours: WorkHoursModel = { start: '08:00', end: '11:00' };
    public departmentDataSource: Object[] = [
        { Text: '  Drivers list one ', Id: 1, Color: '#bbdc00' },
        { Text: '  Drivers list two ', Id: 2, Color: '#9e5fff' }
    ];
    public DriverDataSource: Object[] = [
        { Text: 'Alice', Id: 1, GroupId: 1, Color: '#bbdc00',Vehicle:'VEH120'},
        { Text: 'Nancy', Id: 2, GroupId: 1, Color: '#bbdc00',Vehicle:'VEH140'},
        { Text: 'Robert', Id: 3, GroupId: 1, Color: '#bbdc00',Vehicle:'VEH160'},
        { Text: 'Robson', Id: 4, GroupId: 2, Color: '#9e5fff',Vehicle:'VEH180'},
        { Text: 'Laura', Id: 5, GroupId: 1, Color: '#bbdc00',Vehicle:'VEH200'},
        { Text: 'Roy', Id: 6, GroupId: 2, Color: '#9e5fff',Vehicle:'VEH220'},
        { Text: 'John', Id: 7, GroupId: 2, Color: '#9e5fff',Vehicle:'VEH240'},
        { Text: 'Paul', Id: 8, GroupId: 2, Color: '#9e5fff',Vehicle:'VEH260'}
    ];
    public group: GroupModel = { enableCompactView: false, resources: ['Driverslist', 'Driver'] };
    public allowMultiple: Boolean = false;
    public eventSettings: EventSettingsModel = {
        dataSource: workData,
        fields: {
            subject: { title: 'Customer Name', name: 'Name' },
            location:{title:'Track',name:'Location'},
            startTime: { title: 'From', name: 'StartTime' },
            endTime: { title: 'To', name: 'EndTime' },
            description: { title: 'Task', name: 'Description' }
        }
    };

    public field: Object = { dataSource: customerList, id: 'Id', text: 'Name' };
    public allowDragAndDrop: boolean = true;

    getDriverName(value: ResourceDetails): string {
        return (value as ResourceDetails).resourceData[(value as ResourceDetails).resource.textField] as string;
    }

    getDriverStatus(value: ResourceDetails): boolean {
        let resourceName: string =
            (value as ResourceDetails).resourceData[(value as ResourceDetails).resource.textField] as string;
        if (resourceName === 'Drivers list-one' || resourceName === 'Drivers list-two') {
            return false;
        } else {
            return true;
        }
    }

    getVehicleDesignation(value: ResourceDetails): string {
        let resourceName: string =
            (value as ResourceDetails).resourceData[(value as ResourceDetails).resource.textField] as string;
        if (resourceName === '' || resourceName === 'Drivers list-two') {
            return '';
        } else {
            return (value as ResourceDetails).resourceData.Vehicle as string;
        }
    }
    onItemDrag(event: any): void {
        if (this.scheduleObj.isAdaptive) {
            let classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
            if (classElement) {
                classElement.classList.remove('e-device-hover');
            }
            if (event.target.classList.contains('e-work-cells')) {
                addClass([event.target], 'e-device-hover');
            }
        }
        if (document.body.style.cursor === 'not-allowed') {
            document.body.style.cursor = '';
        }
        if (event.name === 'nodeDragging') {
            let dragElementIcon: NodeListOf<HTMLElement> =
                document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
            for (let i: number = 0; i < dragElementIcon.length; i++) {
                dragElementIcon[i].style.display = 'none';
            }
        }
    }

    onActionBegin(event: ActionEventArgs): void {
        if (event.requestType === 'eventCreate' && this.isTreeItemDropped) {
            let treeViewdata: { [key: string]: Object }[] = this.treeObj.fields.dataSource as { [key: string]: Object }[];
            const filteredPeople: { [key: string]: Object }[] =
                treeViewdata.filter((item: any) => item.Id !== parseInt(this.draggedItemId, 10));
            this.treeObj.fields.dataSource = filteredPeople;
            let elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
            for (let i: number = 0; i < elements.length; i++) {
                remove(elements[i]);
            }
        }
    }

    onTreeDragStop(event: DragAndDropEventArgs): void {
        let treeElement: Element = <Element>closest(event.target, '.e-treeview');
        let classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
        if (classElement) {
            classElement.classList.remove('e-device-hover');
        }
        if (!treeElement) {
            event.cancel = true;
            let scheduleElement: Element = <Element>closest(event.target, '.e-content-wrap');
            if (scheduleElement) {
                let treeviewData: { [key: string]: Object }[] =
                    this.treeObj.fields.dataSource as { [key: string]: Object }[];
                if (event.target.classList.contains('e-work-cells')) {
                    const filteredData: { [key: string]: Object }[] =
                        treeviewData.filter((item: any) => item.Id === parseInt(event.draggedNodeData.id as string, 10));
                    let cellData: CellClickEventArgs = this.scheduleObj.getCellDetails(event.target);
                    let resourceDetails: ResourceDetails = this.scheduleObj.getResourcesByIndex(cellData.groupIndex);
                    let eventData: { [key: string]: Object } = {
                        Name: filteredData[0].Name,
                        StartTime: cellData.startTime,
                        EndTime: cellData.endTime,
                        IsAllDay: cellData.isAllDay,
                        Description: filteredData[0].Description,
                        DriverslistID: resourceDetails.resourceData.GroupId,
                        DriverID: resourceDetails.resourceData.Id
                    };
                    this.scheduleObj.openEditor(eventData, 'Add', true);
                    this.isTreeItemDropped = true;
                    this.draggedItemId = event.draggedNodeData.id as string;
                }
            }
        }
    }
}

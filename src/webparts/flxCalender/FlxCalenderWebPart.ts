import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './FlxCalenderWebPart.module.scss';
import * as strings from 'FlxCalenderWebPartStrings';
import * as $ from "jquery";
import { sp } from "@pnp/pnpjs";
import 'fullcalendar';
import { Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

import "../../ExternalRef/CSS/style.css";
import "../../ExternalRef/CSS/bootstrap.css";
import "../../ExternalRef/js/bootstrap.js";
import * as moment from  "moment";

var arrCalendarEvents=[];
export interface IFlxCalenderWebPartProps {
  description: string;
}
 
  
export default class FlxCalenderWebPart extends BaseClientSideWebPart<IFlxCalenderWebPartProps> {
  public onInit(): Promise<void> {
    return super.onInit().then((_) => 
    {     
      sp.setup({
         spfxContext: this.context,
      })
      
    });
  } 

 
  public render(): void {
    this.domElement.innerHTML = `
    <div class="calendar-section">
    <div class="btn-section text-end"> 
    <button class="btn btn-theme" data-bs-toggle="modal" data-bs-target="#calendarModal">Add Event</button>
    </div>
    <div class="modal fade" id="calendarModal" tabindex="-1" aria-labelledby="calendarModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="calendarModalLabel">Add Event</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body calendar-popup">
        <div class="row align-items-center my-3"><div class="col-5">Title</div><div class="col-1">:</div><div class="col-6"><input type="text" class="form-control" id="" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-5">Start Date</div><div class="col-1">:</div><div class="col-6"><input type="date" class="form-control" id="" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-5">End Date</div><div class="col-1">:</div><div class="col-6"><input type="date" class="form-control" id="" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-5">Type of Event</div><div class="col-1">:</div><div class="col-6"><select class="form-control" id="" aria-describedby=""><option>Select</option></select></div></div>
        <div class="row align-items-center my-3"><div class="col-5">Description</div><div class="col-1">:</div><div class="col-6"><textarea class="form-control" id="" aria-describedby=""></textarea></div></div>
        
      </div> 
      <div class="modal-footer"> 
        <div class="addScreen">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-sm btn-theme">Submit</button>
        </div>
        <div class="viewScreen">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-sm btn-theme">Edit</button>
        
        </div>
      </div>
    </div>
  </div> 
</div>   
      <div id="myCalendar"></div>
      </div>`;  

      getCalendarEvents();
      //BindCalendar("");
       
  } 

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}


function BindCalendar(Calendardetails)
{
  var calendarEl = document.getElementById('myCalendar');
        var calendar = new Calendar(calendarEl, {
          plugins: [ interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin ],
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          },
          initialDate: moment(new Date()).format("YYYY-MM-DD"),
          navLinks: true, // can click day/week names to navigate views
          editable: true,
          dayMaxEvents: true, // allow "more" link when too many events
          events: Calendardetails,
          eventDidMount: function (event) {
            $(event.el).attr('data-trigger', 'focus')
            $(event.el).attr('tabindex', 0)
        }
        });
      
        calendar.render();
}

async function getCalendarEvents()
{
    await sp.web.lists.getByTitle("EventsList").items.select("*").top(5000).get().then((items: any) => 
    {
      
      for(var i=0;i<items.length;i++)
      {

        console.log(moment(items[i].StartDate).format("YYYY-MM-DD")+"T"+moment(items[i].StartDate).format("HH:mm")+":00");
        console.log(moment(items[i].EndDate).format("YYYY-MM-DD")+"T"+moment(items[i].EndDate).format("HH:mm")+":00");

        var sdate=moment(items[i].StartDate).format("YYYY-MM-DD")+"T"+moment(items[i].StartDate).format("HH:mm")+":00";
        var edate=moment(items[i].EndDate).format("YYYY-MM-DD")+"T"+moment(items[i].EndDate).format("HH:mm")+":00";

        arrCalendarEvents.push({
          title: items[i].Title,
          start: sdate,
          end:edate
        });

        
      }

      BindCalendar(arrCalendarEvents);

    }).catch(function(error)
    {
          alert("Error In Calendar Webpart");
    });
}
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
      <div id="myCalender"></div>`;

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
  var calendarEl = document.getElementById('myCalender');
        var calendar = new Calendar(calendarEl, {
          plugins: [ interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin ],
          headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          },
          initialDate: '2018-01-12',
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
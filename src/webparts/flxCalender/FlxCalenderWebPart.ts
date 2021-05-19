import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { escape } from '@microsoft/sp-lodash-subset';


import { SPComponentLoader } from "@microsoft/sp-loader";

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
var EditID="";
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
    <button class="btn btn-theme btn-openmodal" data-bs-toggle="modal" data-bs-target="#calendarModal">Add</button>
    </div>
    <div class="modal fade" id="calendarModal" tabindex="-1" aria-labelledby="calendarModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="calendarModalLabel">Add / Update Event</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body calendar-popup">
        <div class="row align-items-center my-3"><div class="col-5">Title</div><div class="col-1">:</div><div class="col-6"><input type="text" class="form-control" id="eventTitle" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-5">Start Date</div><div class="col-1">:</div><div class="col-6"><input type="date" class="form-control" id="Startdate" value="2013-01-08" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-5">Start Time</div><div class="col-1">:</div>
        <select class="form-control" id="StartTime">
        <option value="00">00</option>
        </select>
        <select class="form-control" id="StartTimeHour">
        <option value="00">00</option>
        </select>
        </div>
        <div class="row align-items-center my-3"><div class="col-5">End Date</div><div class="col-1">:</div><div class="col-6"><input type="date" class="form-control" id="Enddate" value="2013-01-08" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-5">End Time</div><div class="col-1">:</div>
        <select class="form-control" id="EndTime">
        <option value="00">00</option>
        </select>
        <select class="form-control" id="EndTimeHour">
        <option value="00">00</option>
        </select>
        </div>
        <!--<div class="row align-items-center my-3"><div class="col-5">Type of Event</div><div class="col-1">:</div><div class="col-6"><select class="form-control" id="" aria-describedby=""><option>Select</option></select></div></div>-->
        <div class="row align-items-center my-3"><div class="col-5">Description</div><div class="col-1">:</div><div class="col-6"><textarea class="form-control" id="eventDescritpion" aria-describedby=""></textarea></div></div>
      </div> 
      <div class="modal-footer"> 
        <div class="addScreen">
        <button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-sm btn-theme" id="btnmodalSubmit">Submit</button>
        </div>
        <div class="viewScreen">
        <!--<button type="button" class="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>-->
        <button type="button" class="btn btn-sm btn-theme" id="btnmodalEdit" style="display:none">Update</button>
        </div>
      </div>
    </div>
  </div> 
</div>  
      <div id="myCalendar"></div>  
      </div>`;
      
      var htmlfortime="";
      for(var i=0;i<24;i++)
      {
        if(i<10) 
        htmlfortime+="<option value=0"+i+">0"+i+"</option>";
        else
        htmlfortime+="<option value="+i+">"+i+"</option>";
      }

      $("#StartTime").html('');
      $("#StartTime").html(htmlfortime);

      $("#EndTime").html('');
      $("#EndTime").html(htmlfortime);

      var htmlforHour="";
      for(var i=0;i<60;i++)
      {
        if(i<9) 
        htmlforHour+="<option value=0"+i+">0"+i+"</option>";
        else
        htmlforHour+="<option value="+i+">"+i+"</option>";

        i=i+4;
      }

      $("#StartTimeHour").html('');
      $("#StartTimeHour").html(htmlforHour);

      $("#EndTimeHour").html('');
      $("#EndTimeHour").html(htmlforHour);



      $("#btnmodalSubmit").click(function()
      {
          insertevent();
      });

      $(".btn-close,.btn-secondary").click(function()
      {
        $("#btnmodalSubmit").show();
        $("#btnmodalEdit").hide();
      });

 

      $(".btn-openmodal").click(function()
      {
        cleardata();
      });

      $(document).on("click",".clsEventEdit",function()
      {
          $(".btn-openmodal").trigger('click');

          $("#btnmodalEdit").show();
          $("#btnmodalSubmit").hide();

          var indexid=$(this).attr('data-id');
          EditID=indexid;
          var filteredarray=[];
          for(var i=0;i<arrCalendarEvents.length;i++)
          {
                if(arrCalendarEvents[i].id==indexid)
                {
                  filteredarray.push(arrCalendarEvents[i]);
                }
          }

        if(filteredarray[0].title)
        $("#eventTitle").val(filteredarray[0].title);

        $("#Startdate").val(moment(filteredarray[0].start).format("YYYY-MM-DD"));
        $("#Enddate").val(moment(filteredarray[0].end).format("YYYY-MM-DD"));

        $("#StartTime").val(moment(filteredarray[0].start).format("HH"));
        $("#StartTimeHour").val(moment(filteredarray[0].start).format("mm"));
        $("#EndTime").val(moment(filteredarray[0].end).format("HH"));
        $("#EndTimeHour").val(moment(filteredarray[0].end).format("mm"));

        if(filteredarray[0].description)
        $("#eventDescritpion").val(filteredarray[0].description);

      });


      $("#btnmodalEdit").click(function()
      {
        updateevent(EditID)
        
      });
      

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
            right: 'dayGridMonth' 
          },
          initialDate: moment(new Date()).format("YYYY-MM-DD"),
          navLinks: true, // can click day/week names to navigate views
          editable: true,
          dayMaxEvents: true, // allow "more" link when too many events  
          events: Calendardetails,
          eventDidMount: function (event) 
          {
            $(event.el).attr('data-trigger', 'focus')
            $(event.el).attr('data-id',event.event.id);
            $(event.el).addClass("clsEventEdit")
          }
        });
        calendar.refetchEvents();
        calendar.render();
        $('.clsEventEdit').each(function()
{
    $(this).removeClass('fc-event-draggable');
});
        cleardata();
        $("#Startdate,#Enddate").val(moment().format("YYYY-MM-DD"));
}

async function getCalendarEvents()
{
    await sp.web.lists.getByTitle("EventsList").items.select("*").top(5000).get().then((items: any) => 
    {
      
      arrCalendarEvents=[];
      for(var i=0;i<items.length;i++)
      {

        

        var sdate=moment(items[i].StartDate).format("YYYY-MM-DD")+"T"+moment(items[i].StartDate).format("HH:mm")+":00";
        var edate=moment(items[i].EndDate).format("YYYY-MM-DD")+"T"+moment(items[i].EndDate).format("HH:mm")+":00";

        arrCalendarEvents.push({
          id:items[i].ID,
          title: items[i].Title,
          start: sdate,
          end:edate,
          description: items[i].Description
        });

        
      }

      BindCalendar(arrCalendarEvents);

    }).catch(function(error)
    {
          alert("Error In Calendar Webpart");
    });
}


async function insertevent()
{
  
  var starttime=$("#Startdate").val()+"T"+$("#StartTime").val()+":"+$("#StartTimeHour").val()+":00";
  var endtime=$("#Enddate").val()+"T"+$("#EndTime").val()+":"+$("#EndTimeHour").val()+":00";

  console.log(moment(starttime).format());
  var requestdata = {
    Title:$("#eventTitle").val(),
    StartDate: starttime,
    EndDate:endtime,
    Description:$("#eventDescritpion").val()
  };
    await sp.web.lists
      .getByTitle("EventsList")
      .items.add(requestdata)
      .then(async function (data) 
      {
          await getCalendarEvents();
          $(".btn-close").trigger('click');
        
        }).catch(function (error) 
      {
        alert("Error Occured");
      });
}


async function updateevent(itemid)
{
  
  var starttime=$("#Startdate").val()+"T"+$("#StartTime").val()+":"+$("#StartTimeHour").val()+":00";
  var endtime=$("#Enddate").val()+"T"+$("#EndTime").val()+":"+$("#EndTimeHour").val()+":00";

  console.log(moment(starttime).format());
  var requestdata = {
    Title:$("#eventTitle").val(),
    StartDate: starttime,
    EndDate:endtime,
    Description:$("#eventDescritpion").val()
  };
    await sp.web.lists
      .getByTitle("EventsList")
      .items.getById(itemid).update(requestdata)
      .then(async function (data) 
      {
          await getCalendarEvents();
          $(".btn-close").trigger('click');
        
        }).catch(function (error) 
      {
        alert("Error Occured");
      });
}

function cleardata()
{
  $("#eventTitle,#eventDescritpion").val("");
  $("#Startdate,#Enddate").val("");
  $("#Startdate,#Enddate").val(moment().format("YYYY-MM-DD"));
  $("#StartTime,#EndTime,#StartTimeHour,#EndTimeHour").val("00");
  EditID="";
}
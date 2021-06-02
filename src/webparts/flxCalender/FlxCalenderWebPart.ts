import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { escape } from "@microsoft/sp-lodash-subset";

import { SPComponentLoader } from "@microsoft/sp-loader";

import styles from "./FlxCalenderWebPart.module.scss";
import * as strings from "FlxCalenderWebPartStrings";
import * as $ from "jquery";
import { sp } from "@pnp/pnpjs";
import "fullcalendar";
import { Calendar } from "@fullcalendar/core";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

import "../../ExternalRef/CSS/style.css";
import "../../ExternalRef/CSS/bootstrap.css";
import "../../ExternalRef/CSS/datetimepicker.css";
import "../../ExternalRef/js/bootstrap.js";
import "../../ExternalRef/js/datetimepicker.js";
import * as moment from "moment";
import "../../ExternalRef/css/alertify.min.css";
var alertify: any = require("../../ExternalRef/js/alertify.min.js");

import "../../../node_modules/spectrum-colorpicker2/src/spectrum.js";
SPComponentLoader.loadCss(
  "https://cdn.jsdelivr.net/npm/spectrum-colorpicker2/dist/spectrum.min.css"
);

var arrCalendarEvents = [];
var EditID = "";
let listUrl = "";
var alleventitem = [];
export interface IFlxCalenderWebPartProps {
  description: string;
}

export default class FlxCalenderWebPart extends BaseClientSideWebPart<IFlxCalenderWebPartProps> {
  public onInit(): Promise<void> {
    return super.onInit().then((_) => {
      sp.setup({
        spfxContext: this.context,
      });
    });
  }

  public render(): void {
    listUrl = this.context.pageContext.web.absoluteUrl;
    var siteindex = listUrl.toLocaleLowerCase().indexOf("sites");
    listUrl = listUrl.substr(siteindex - 1) + "/Lists/";
    this.domElement.innerHTML = `
    <div class="d-flex">
<div class="cal-sec-eventtypes my-3"> 
<div class="tile-head-calendar p-1  ">  
    <h6 class="text-center mt-2 my-1">Event Types</h6>          
    </div>  
    <div class="boxcal">
<ul class="list-unstyled ps-2 pe-2" id="bindeventtype">  

<li class="py-2  d-flex row eventborder">         
<div class="col-2 "><span class= "eventtypescircle"><span></div><div class="col-10">Type 1</div>
</li> 
<li class="py-2  d-flex row eventborder">     
<div class="col-2 "><span class= "eventtypescircle"><span></div><div class="col-10">Type 1</div>
</li> 
</ul>      
        
<div class="calcustomize mx-3">
<a href="#" class=" customizecalendar  remove_under"  data-bs-toggle="modal" data-bs-target="#staticBackdropthree">
+ Customize   </a>
</div>
 
</div>   
</div>  
<div class="calendar-section">   
    <div class="btn-section text-end">  
    <button class="btn btn-outline-theme btn-openmodal rounded-0" data-bs-toggle="modal" data-bs-target="#calendarModal">Add</button>
    </div>
      <div id="myCalendar"></div>     
      </div>
      </div>
      
      <div class="modal fade" id="calendarModal" tabindex="-1" aria-labelledby="calendarModalLabel" aria-hidden="true">
  <div class="modal-dialog calendar-modal">
    <div class="modal-content rounded-0">     
      <div class="modal-header">
        <h5 class="modal-title fw-bold w-100 text-center" id="calendarModalLabel">Add / Update Event</h5>
       <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
      </div>
      <div class="modal-body calendar-popup">
        <div class="row align-items-center my-3"><div class="col-4">Title</div><div class="col-1">:</div><div class="col-7"><input type="text" class="form-control rounded-0" id="eventTitle" aria-describedby=""></div></div>
        <div class="row align-items-center my-3"><div class="col-4">Start Date</div><div class="col-1">:</div><div class="col-7"><input type="text" class="form-control rounded-0" id="Startdate" value="" aria-describedby=""></div></div>
        
        <!-- <div class="row align-items-center my-3"><div class="col-4">Start Time</div><div class="col-1">:</div>
        <select class="form-control" id="StartTime">
        <option value="00">00</option>
        </select>
        <select class="form-control" id="StartTimeHour">
        <option value="00">00</option>
        </select>
        </div>-->
        <div class="row align-items-center my-3"><div class="col-4">End Date</div><div class="col-1">:</div><div class="col-7"><input type="text" class="form-control rounded-0" id="Enddate" value="" aria-describedby=""></div></div>
        
        <!-- <div class="row align-items-center my-3"><div class="col-4">End Time</div><div class="col-1">:</div>
        <div class="col-7">
        <select class="form-control" id="EndTime">
        <option value="00">00</option>
        </select>       
        <select class="form-control" id="EndTimeHour">  
        <option value="00">00</option>
        </select></div>
        </div>-->     
        <div class="row align-items-center my-3"><div class="col-4">Type of Event</div><div class="col-1">:</div>
        <div class="col-7 custom-arrow"><select class="form-control rounded-0" id="TypeOfEvent" aria-describedby="">
        <option>Select</option></select></div> </div> 
        <div class="row align-items-center my-3"><div class="col-4">Description</div><div class="col-1">:</div><div class="col-7">
        <textarea class="form-control rounded-0" id="eventDescritpion" aria-describedby=""></textarea>
        </div></div> 
      </div>    
      <div class="modal-footer justify-content-between"> 
      <div class="btns-left">
      <button type="button" class="btn btn-sm btn-danger rounded-0" id="btnmodalDelete" style="display:none" data-bs-toggle="modal" data-bs-target="#deleteAlterModal">Delete</button>
      </div>
        <div class="btns-right d-flex">
        <div class="addScreen">
        <button type="button" class="btn btn-sm btn-secondary rounded-0" id="btnEventModalClose" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-sm btn-theme rounded-0" id="btnmodalSubmit">Submit</button>    
        </div>
        <div class="viewScreen">
        <!--<button type="button" class="btn btn-sm btn-secondary rounded-0" data-bs-dismiss="modal">Close</button>-->
        <button type="button" class="btn btn-sm btn-theme ms-2 rounded-0" id="btnmodalEdit" style="display:none">Update</button>
        </div>
        </div>
      </div>
    </div>
  </div> 
</div>  
</div>
      
      <div class="modal fade" id="deleteAlterModal" tabindex="-1" aria-labelledby="deleteAlterModalLabel" aria-hidden="true">
  <div class="modal-dialog delete-warning-dialog">
    <div class="modal-content rounded-0">
      <div class="modal-header">
        
        <!--<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>-->
      </div>
      <div class="modal-body delete-warning text-center pt-5">
      <h5 class="modal-title" id="deleteAlterModalLabel">Confirmation</h5>
        <p class="mb-0">Are you sure want to delete this Event?</p>
      </div> 
      <div class="modal-footer">
        <button type="button" id="btnCancelDeleteEvent" class="btn btn-sm btn-secondary rounded-0" data-bs-dismiss="modal">No</button>
        <button type="button" class="btn btn-sm btn-danger rounded-0" id="confirmDeleteEvent">Yes</button>
      </div>
    </div>
  </div> 
</div>
                        <!-- edit type of event -->
           
           <div class="modal fade" id="staticBackdropthree" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="staticBackdropLabel" aria-hidden="true">
  <div class="modal-dialog cal-modal-dialog ">  
    <div class="modal-content rounded-0">  
      <div class="modal-header modal-tile-header">   
        <h5 class="modal-title w-100 text-center modallearn-color" id="staticBackdropLabel"> Add / Edit Event Type</h5>
     <!--   <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button> -->
      </div>  
         
        
      <div class="modal-body  modalbody-CALENDAR">
     
      <div class="row my-2 "><div class="col-1"></div><div class="col-2 text-center fw-bolder">Title</div>
      <div class="col-7 text-center fw-bolder headcoloralign">Color</div></div>
      <div id="Vieweventtype"></div>    
      
    <div class="row align-items-start my-3 mx-2 addeventscreen"><div class="col-1"></div><div class="col-4">
      <input type="text" class="form-control  rounded-0" id="addnewevent" autocomplete="off" aria-describedby="" ></div>
      <div class="col-5">
      <input type="text" class="form-control  rounded-0" id="addnewcolor" autocomplete="off" aria-describedby="" ></div>
      <div class= "col-2">
      <span class="tickiconaddcal" id ="btnEventSubmit"> </span>
      </div>  
           
           
    </div>    
  
    <!--<div class="d-flex justify-content-end addtypescal">    
    <span class= "addiconeidttypes" > </span>
    </div> -->
    <!-- <div class="row my-2 justify-content-center addeventscreen"><div class="col-1"></div><div class="col-2 text-center fw-bolder">Title</div>
      <div class="col-7 text-center fw-bolder ">Color</div></div> -->
                 
      
    <div class="modal-footer btneventtypes "> 
        <div class="viewScreencal">
        <button type="button" class="btn btn-sm btn-secondary rounded-0" id="btnEventClose" data-bs-dismiss="modal">Close</button> 
                </div>
       
      </div>
    </div>    
  </div>
  </div>
</div>  
           
           
           
          <!-- Delete Modal -->
           
                <div class="modal fade" id="" tabindex="-1" aria-labelledby="AnADeleteModalLabel" aria-hidden="true">
             <div class="modal-dialog ">
               <div class="modal-content rounded-0">
                 <div class="modal-header">
                    
                   <!-- <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>-->
                 </div>
                 <div class="modal-body"> 
                 <h5 class="modal-title" id="">Confirmation</h5>
                 <p class="mb-0">Are you sure want to Delete?</p>
                 </div>
                 <div class="modal-footer">
                   <button type="button" id="cancelEventDelete" class="btn btn-sm btn-secondary rounded-0" data-bs-dismiss="modal">No</button>
                   <button type="button" id="btnDeleteEvent" class="btn btn-sm btn-danger rounded-0">Yes</button>
                 </div>
               </div>
             </div>
           </div> 
           <!-- Delete Modal -->  
      
      `;
    BindTypes();

    $(document).on("click", ".editiconeventtypes", async function () {
      var editdata = "";
      editdata = $(this).attr("data-id");
      console.log(editdata);
      $(".pencil" + editdata).hide();
      $(".dlt" + editdata).hide();
      $(".tick" + editdata).show();
      $(".label" + editdata).hide();
      $(".view" + editdata).show();
    });
    $(document).on("click", ".tickiconeventtypes", async function () {
      var editdata = "";
      editdata = $(this).attr("data-id");
      console.log(editdata);

      await updateeventtype(editdata);
    });
    $(document).on("click", ".deleteiconeventtypes", async function () {
      var editdata = "";
      editdata = $(this).attr("data-id");
      console.log(editdata);

      await DeleteEventType(editdata);
    });
    // $(".editiconeventtypes").click(function()
    // {
    //   $(".editiconeventtypes").hide();
    //   $(".deleteiconeventtypes").hide();
    //   $(".tickiconeventtypes").show();
    // });
    // $(".tickiconeventtypes").click(function()
    // {
    //   $(".tickiconeventtypes").hide();
    //   $(".editiconeventtypes").show();
    //   $(".deleteiconeventtypes").show();

    // });

    $("#btnEventClose").click(function () {
      BindTypes();
      geteventtype();
    });
    $("#btnEventSubmit").click(async function () {
      if (mandatoryforaddaction()) {
        await inserteventtype();
      } else {
        console.log("All fileds not filled");
      }
    });
    $("#Startdate").datetimepicker({
      dateFormat: "dd/mm/YY H:m",
    });
    $("#Enddate").datetimepicker({
      dateFormat: "dd/mm/YY H:m",
    });
    var htmlfortime = "";
    // for(var i=0;i<24;i++)
    // {
    //   if(i<10)
    //   htmlfortime+="<option value=0"+i+">0"+i+"</option>";
    //   else
    //   htmlfortime+="<option value="+i+">"+i+"</option>";
    // }
    // $("#StartTime").html('');
    // $("#StartTime").html(htmlfortime);
    // $("#EndTime").html('');
    // $("#EndTime").html(htmlfortime);
    // var htmlforHour="";
    // for(var i=0;i<60;i++)
    // {
    //   if(i<9)
    //   htmlforHour+="<option value=0"+i+">0"+i+"</option>";
    //   else
    //   htmlforHour+="<option value="+i+">"+i+"</option>";
    //   i=i+4;
    // }
    // $("#StartTimeHour").html('');
    // $("#StartTimeHour").html(htmlforHour);
    // $("#EndTimeHour").html('');
    // $("#EndTimeHour").html(htmlforHour);
    $("#btnmodalSubmit").click(function () {
      insertevent();
    });

    // $(".btn-close,.btn-secondary").click(function()
    // {
    //   $("#btnmodalSubmit").show();
    //   $("#btnmodalEdit").hide();
    //   $("#btnmodalDelete").hide();
    // });

    $("#btnEventModalClose").click(function () {
      $("#btnmodalSubmit").show();
      $("#btnmodalEdit").hide();
      $("#btnmodalDelete").hide();
    });
    $(".btn-openmodal").click(function () {
      $("#calendarModalLabel").text("Add Event");
      cleardata();
    });
    $(document).on("click", ".clsEventEdit", function () {
      $(".btn-openmodal").trigger("click");
      $("#calendarModalLabel").text("Edit Event");
      $("#btnmodalDelete").show();
      $("#btnmodalEdit").show();
      $("#btnmodalSubmit").hide();
      var indexid = $(this).attr("data-id");
      EditID = indexid;
      var filteredarray = [];
      for (var i = 0; i < arrCalendarEvents.length; i++) {
        if (arrCalendarEvents[i].id == indexid) {
          filteredarray.push(arrCalendarEvents[i]);
        }
      }

      if (filteredarray[0].title) $("#eventTitle").val(filteredarray[0].title);
      // $("#Startdate").val(moment(filteredarray[0].start).format("YYYY-MM-DD"));
      // $("#Enddate").val(moment(filteredarray[0].end).format("YYYY-MM-DD"));
      // Maasi

      $("#Startdate").val(
        moment(filteredarray[0].start).format("YYYY/MM/DD HH:mm")
      );
      $("#Enddate").val(
        moment(filteredarray[0].end).format("YYYY/MM/DD HH:mm")
      );
      // $("#StartTime").val(moment(filteredarray[0].start).format("HH"));
      // $("#StartTimeHour").val(moment(filteredarray[0].start).format("mm"));
      // $("#EndTime").val(moment(filteredarray[0].end).format("HH"));
      // $("#EndTimeHour").val(moment(filteredarray[0].end).format("mm"));
      $("#TypeOfEvent").val(filteredarray[0].TypeOfEvent);
      $("#EventColor").val(filteredarray[0].ColorId);
      if (filteredarray[0].description)
        $("#eventDescritpion").val(filteredarray[0].description);
    });

    $("#btnmodalEdit").click(function () {
      updateevent(EditID);
    });
    $("#btnmodalDelete").click(() => {
      (<HTMLElement>(
        document.querySelector(".modal-dialog.calendar-modal")
      )).style.display = "none";
      // $(".modal-dialog.calendar-modal").css("display:none")
    });
    $("#btnCancelDeleteEvent").click(() => {
      (<HTMLElement>(
        document.querySelector(".modal-dialog.calendar-modal")
      )).style.display = "block";
      // $(".modal-dialog.calendar-modal").css("display:block")
    });
    $("#confirmDeleteEvent").click(() => {
      deleteEvent(EditID);
    });
    getCalendarEvents();
    geteventtype();

    //BindCalendar("");
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}

const BindTypes = async () => {
  let TypesOfEvent = await sp.web
    .getList(listUrl + "TypeOfEvent")
    .items.top(5000)
    .get();
  let typesHtml = "<option value='0'>Select</option>";
  let typescolorHtml = "<option value='0'>Select</option>";
  TypesOfEvent.forEach((li) => {
    typesHtml += `<option value="${li.ID}">${li.Title}</option>`;
    typescolorHtml += `<option value="${li.ID}">${li.Color}</option>`;
  });
  $("#TypeOfEvent").html(typesHtml);
  $("#EventColor").html(typescolorHtml);
  $("#addnewcolor").spectrum({
    type: "component",
  });
  setTimeout(function () {
    $(".titlecolor").spectrum({
      type: "component",
    });
  }, 500);
};
function BindCalendar(Calendardetails) {
  var calendarEl = document.getElementById("myCalendar");

  var calendar = new Calendar(calendarEl, {
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth",
    },
    initialDate: moment(new Date()).format("YYYY-MM-DD"),
    navLinks: true, // can click day/week names to navigate views
    editable: true,
    dayMaxEvents: true, // allow "more" link when too many events
    events: Calendardetails,
    eventDidMount: function (event) {
      $(event.el).attr("data-trigger", "focus");
      $(event.el).attr("data-id", event.event.id);
      $(event.el).addClass("clsEventEdit");
    },
  });
  calendar.refetchEvents();
  calendar.render();
  $(".clsEventEdit").each(function () {
    $(this).removeClass("fc-event-draggable");
  });
  cleardata();
  $("#Startdate,#Enddate").val(moment().format("YYYY-MM-DD"));
}

async function getCalendarEvents() {
  await sp.web.lists
    .getByTitle("EventsList")
    .items.select(
      "*",
      "TypeOfEvent/Title",
      "TypeOfEvent/ID",
      "Color/Title",
      "Color/ID",
      "Color/Color"
    )
    .expand("TypeOfEvent", "Color")
    .top(5000)
    .get()
    .then((items: any) => {
      console.log(items);

      arrCalendarEvents = [];
      for (var i = 0; i < items.length; i++) {
        var sdate =
          moment(items[i].StartDate).format("YYYY-MM-DD") +
          "T" +
          moment(items[i].StartDate).format("HH:mm") +
          ":00";
        var edate =
          moment(items[i].EndDate).format("YYYY-MM-DD") +
          "T" +
          moment(items[i].EndDate).format("HH:mm") +
          ":00";
        arrCalendarEvents.push({
          id: items[i].ID,
          title: items[i].Title,
          start: sdate,
          end: edate,
          description: items[i].Description,
          backgroundColor: items[i].Color.Color,
          borderColor: items[i].Color.Color,
          ColorId: items[i].ColorId,
          TypeOfEvent: items[i].TypeOfEventId,
        });
      }
      BindCalendar(arrCalendarEvents);
    })
    .catch(function (error) {
      alert("Error In Calendar Webpart");
    });
}
async function insertevent() {
  // var starttime=$("#Startdate").val()+"T"+$("#StartTime").val()+":"+$("#StartTimeHour").val()+":00";
  // var endtime=$("#Enddate").val()+"T"+$("#EndTime").val()+":"+$("#EndTimeHour").val()+":00";
  let starttime = $("#Startdate").val().split(" ").join("T");
  let endtime = $("#Enddate").val().split(" ").join("T");
  // console.log(moment(starttime).format());
  console.log($("#TypeOfEvent").val());

  var requestdata = {
    Title: $("#eventTitle").val(),
    StartDate: starttime,
    EndDate: endtime,
    Description: $("#eventDescritpion").val(),
    TypeOfEventId: parseInt($("#TypeOfEvent").val()),
    ColorId: parseInt($("#TypeOfEvent").val()),
  };
  await sp.web.lists
    .getByTitle("EventsList")
    .items.add(requestdata)
    .then(async function (data) {
      await getCalendarEvents();
      $("#btnEventModalClose").trigger("click");
      AlertMessage("<div class='alertfy-success'>Submitted successfully</div>");
    })
    .catch(function (error) {
      alert("Error Occured");
    });
}
async function updateevent(itemid) {
  // var starttime=$("#Startdate").val()+"T"+$("#StartTime").val()+":"+$("#StartTimeHour").val()+":00";
  // var endtime=$("#Enddate").val()+"T"+$("#EndTime").val()+":"+$("#EndTimeHour").val()+":00";
  //Maasi
  let starttime = $("#Startdate").val().split(" ").join("T");
  let endtime = $("#Enddate").val().split(" ").join("T");
  console.log(moment(starttime).format());
  var requestdata = {
    Title: $("#eventTitle").val(),
    StartDate: starttime,
    EndDate: endtime,
    Description: $("#eventDescritpion").val(),
    TypeOfEventId: parseInt($("#TypeOfEvent").val()),
    ColorId: parseInt($("#TypeOfEvent").val()),
  };
  await sp.web.lists
    .getByTitle("EventsList")
    .items.getById(itemid)
    .update(requestdata)
    .then(async function (data) {
      await getCalendarEvents();
      $("#btnEventModalClose").trigger("click");
      AlertMessage("<div class='alertfy-success'>Updated successfully</div>");
    })
    .catch(function (error) {
      alert("Error Occured");
    });
}
const deleteEvent = async (itemid) => {
  await sp.web.lists
    .getByTitle("EventsList")
    .items.getById(itemid)
    .delete()
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      alert("Error Occured");
    });
};
function cleardata() {
  $("#eventTitle,#eventDescritpion").val("");
  $("#Startdate,#Enddate").val("");
  $("#Startdate,#Enddate").val(moment().format("YYYY/MM/DD HH:mm"));
  $("#StartTime,#EndTime,#StartTimeHour,#EndTimeHour").val("00");
  $("#EventColor").val("0");
  $("#TypeOfEvent").val("0");
  EditID = "";
}
async function geteventtype() {
  $("#addnewevent").val("");
  $("#addnewcolor").val("");
  $(".addeventscreen").hide();
  await sp.web.lists
    .getByTitle("TypeOfEvent")
    .items.select("*")
    .get()
    .then(async (item) => {
      var htmlforeventtype = "";
      //  var htmlforbindeventtype="";
      var count = 0;
      alleventitem = item;
      console.log("item");
      console.log(alleventitem);
      if (item.length > 0) {
        for (var i = 0; i < item.length; i++) {
          count++;
          if (count == item.length) {
            htmlforeventtype += `<div class="row align-items-start my-3 mx-2"><div class="col-1">${
              i + 1
            }</div><div class="col-4">
            <div class="label${i} titlecolalign"><label class="">${
              item[i].Title
            }</label></div>
        <input type="text" class="form-control rounded-0 titleevent view${i}" data-id="${i}" value="${
              item[i].Title
            }"></div>
        <div class="col-5">  
        <div class="label${i} coloralgin"><label class="">${item[i].Color}</label></div>
        <input type="text" class="form-control rounded-0 titlecolor view${i}" data-id="${i}" value="${
              item[i].Color
            }"></div>
       <div class="col-2 editicontypes">
       <span class="editiconeventtypes pencil${i}" data-id="${i}"></span>  
       <span class="deleteiconeventtypes dlt${i}" data-id="${i}"></span> 
       <span class="tickiconeventtypes tick${i}" data-id="${i}"></span>
       <span class= "addiconeidttypes"> </span> </div></div>`;
          } else {
            htmlforeventtype += `<div class="row align-items-start my-3 mx-2"><div class="col-1">${
              i + 1
            }</div><div class="col-4">
            <div class="label${i} titlecolalign"><label class="">${
              item[i].Title
            }</label></div>
        <input type="text" class="form-control rounded-0 titleevent view${i}" data-id="${i}" value="${
              item[i].Title
            }"></div>
        <div class="col-5">
        <div class="label${i} coloralgin "><label class="">${item[i].Color}</label></div>
        <input type="text" class="form-control rounded-0 titlecolor view${i}" data-id="${i}" value="${
              item[i].Color
            }"></div>
       <div class="col-2 editicontypes">
       <span class="editiconeventtypes pencil${i}" data-id="${i}"></span>  
       <span class="deleteiconeventtypes dlt${i}" data-id="${i}"></span> 
       <span class="tickiconeventtypes tick${i}" data-id="${i}"></span> </div></div>`;
          }

          // htmlforbindeventtype+=`<div style="background-color:${item[i].Color}"></div><a href="#" class="list-group-item list-group-item-action text-center" style="background-color:${item[i].Color}">${item[i].Title}</a>`;
        }
        $("#Vieweventtype").html("");
        $("#Vieweventtype").html(htmlforeventtype);
        //  $("#bindeventtype").html("");
        //  $("#bindeventtype").html(htmlforbindeventtype);
        $(".tickiconeventtypes").hide();
        $(".titleevent").hide();
        $(".titlecolor").hide();

        $(".addiconeidttypes").click(function () {
          $(".addeventscreen").show();
        });
        $(".editiconcalendar").click(function () {
          $(".addeventscreen").hide();
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
}
async function inserteventtype() {
  var requestdata = {
    Title: $("#addnewevent").val(),
    Color: $("#addnewcolor").val(),
  };
  await sp.web.lists
    .getByTitle("TypeOfEvent")
    .items.add(requestdata)
    .then(async function (data) {
      Alert("<div class='alertfy-success'>Submitted successfully</div>");
    })
    .catch(function (error) {
      alert("Error Occured");
    });
}
async function updateeventtype(TypeID) {
  $(".titleevent").each(function () {
    alleventitem[$(this).attr("data-id")].Title = $(this).val();
  });
  $(".titlecolor").each(function () {
    alleventitem[$(this).attr("data-id")].Color = $(this).val();
  });
  var requestdata = {};
  var Id = alleventitem[TypeID].ID;
  requestdata = {
    Title: alleventitem[TypeID].Title,
    Color: alleventitem[TypeID].Color,
  };
  await sp.web.lists
    .getByTitle("TypeOfEvent")
    .items.getById(Id)
    .update(requestdata)
    .then(async function (data) {
      Alert("<div class='alertfy-success'>Updated successfully</div>");
    })
    .catch(function (error) {
      alert("Error Occured");
    });
}
function DeleteEventType(TypeID) {
  var Id = alleventitem[TypeID].ID;
  sp.web.lists
    .getByTitle("TypeOfEvent")
    .items.getById(parseInt(Id))
    .delete()
    .then(() => {
      location.reload();
    })
    .catch((error) => {
      alert("Error Occured");
    });
}
function mandatoryforaddaction() {
  var isAllvalueFilled = true;
  if (!$("#addnewevent").val()) {
    alertify.error("Please enter Type of Event");
    isAllvalueFilled = false;
  } else if (!$("#addnewcolor").val()) {
    alertify.error("Please enter Color");
    isAllvalueFilled = false;
  }
  return isAllvalueFilled;
}
function Alert(strMewssageEN) {
  alertify
    .alert()
    .setting({
      label: "OK",

      message: strMewssageEN,
      onok: function () {
        window.location.href = "#";
        BindTypes();
        geteventtype();
      },
    })

    .show()
    .setHeader("<div class='fw-bold alertifyConfirmation'>Confirmation</div> ")
    .set("closable", false);
}
function AlertMessage(strMewssageEN) {
  alertify
    .alert()
    .setting({
      label: "OK",

      message: strMewssageEN,
      onok: function () {
        window.location.href = "#";
        location.reload();
      },
    })

    .show()
    .setHeader("<div class='fw-bold alertifyConfirmation'>Confirmation</div> ")
    .set("closable", false);
}

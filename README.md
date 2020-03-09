# Syrus 4 SDK for nodejs
Interactive function to consult enable or disable multiple modules for APEX OS

## Quick Start
Install using npm github
```bash
$ npm install git+ssh://git@github.com/dctdevelop/syrus4-nodejs.git#master
```


## Modules

<dl>
<dt><a href="#module_GPS">GPS</a></dt>
<dd><p>GPS module get information about gps and location in ApexOS</p>
</dd>
<dt><a href="#module_IOS">IOS</a></dt>
<dd><p>IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
TODO: implement this</p>
</dd>
<dt><a href="#module_Mobile">Mobile</a></dt>
<dd><p>Mobile module to interacte with the Mobile Network allow to set rf configurations and read them</p>
</dd>
<dt><a href="#module_System-Info">System-Info</a></dt>
<dd><p>System module get information about ApexOS</p>
</dd>
<dt><a href="#module_Update">Update</a></dt>
<dd><p>Update module check for update and make update for ApexOS</p>
</dd>
<dt><a href="#module_WIFI">WIFI</a></dt>
<dd><p>WIFI module to interacte with the enable/disable WIFI mode  with Apex OS</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#list">list()</a></dt>
<dd><p>returns the list of the connected clients to the hotspot</p>
</dd>
<dt><a href="#state">state()</a></dt>
<dd><p>returns the state of the connected clients to the hotspot</p>
</dd>
<dt><a href="#start">start()</a></dt>
<dd><p>start the hotspot service, also stop wifi service</p>
</dd>
<dt><a href="#stop">stop()</a></dt>
<dd><p>stops the hotspot service</p>
</dd>
<dt><a href="#reset">reset()</a></dt>
<dd><p>executes a stop-start in the same call</p>
</dd>
<dt><a href="#route">route(netInterface)</a></dt>
<dd><p>Use this option for forwarding the wlan traffic to another interface, it allows you to have internet access by specifying the output interface</p>
</dd>
<dt><a href="#edit">edit(parameter, newValue)</a></dt>
<dd><p>edits the parameter received in the hotspot configuration file. <br>
Example apx-hotspot edit wpa_passphrase myNewPass1234
Possible Values: &quot;wpa_passphrase&quot; | &quot;ssid&quot; | &quot;max_num_sta&quot; | &quot;channel&quot; | &quot;wpa_key_mgmt&quot;</p>
</dd>
</dl>

<a name="module_GPS"></a>

## GPS
GPS module get information about gps and location in ApexOS


* [GPS](#module_GPS)
    * [~getCurrentPosition()](#module_GPS..getCurrentPosition)
    * [~watchPosition(callback, errorCallback, config)](#module_GPS..watchPosition)
    * [~watchGPS(callback, errorCallback)](#module_GPS..watchGPS)

<a name="module_GPS..getCurrentPosition"></a>

### GPS~getCurrentPosition()
Get last current location from GPS

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  
<a name="module_GPS..watchPosition"></a>

### GPS~watchPosition(callback, errorCallback, config)
allows to subscribe to position events in GPS module

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| callback | handler to execute when new gps position arrives |
| errorCallback | Errorcallback executes when is unable to get gps location |
| config | Object coniguration how evaluate criteria for watchPosition |

<a name="module_GPS..watchGPS"></a>

### GPS~watchGPS(callback, errorCallback)
allows to subscribe to gps data changes in GPS module

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| callback | handler to execute when new gps data arrives |
| errorCallback | Errorcallback executes when is unable to get gps location |

<a name="module_IOS"></a>

## IOS
IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS
TODO: implement this


* [IOS](#module_IOS)
    * [~watchInputState(inputName, cb, errorCallback)](#module_IOS..watchInputState)
    * [~getInputState(inputName)](#module_IOS..getInputState)
    * [~setOutputState(inputName, state)](#module_IOS..setOutputState)
    * [~getAll()](#module_IOS..getAll)

<a name="module_IOS..watchInputState"></a>

### IOS~watchInputState(inputName, cb, errorCallback)
Allow to subcribe to changes in a input or output accepts sub patterns

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  

| Param | Default | Description |
| --- | --- | --- |
| inputName | <code>*</code> | input or patter to subscribe |
| cb |  | callback execute everytime the input state changed, first argument contains the new state |
| errorCallback |  |  |

<a name="module_IOS..getInputState"></a>

### IOS~getInputState(inputName)
get a promise that resolve the current input or output state

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  

| Param | Default | Description |
| --- | --- | --- |
| inputName | <code>IGN</code> | the input/output requested |

<a name="module_IOS..setOutputState"></a>

### IOS~setOutputState(inputName, state)
Allow to change the state of an output

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  

| Param | Default | Description |
| --- | --- | --- |
| inputName | <code>OUT1</code> | the output to change state |
| state | <code>true</code> | the new state  of the output |

<a name="module_IOS..getAll"></a>

### IOS~getAll()
Get the current state of all inputs, outputs and analogs in the Syrus4 device

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  
<a name="module_Mobile"></a>

## Mobile
Mobile module to interacte with the Mobile Network allow to set rf configurations and read them


* [Mobile](#module_Mobile)
    * [~getInfo()](#module_Mobile..getInfo)
    * [~set(key, value)](#module_Mobile..set)

<a name="module_Mobile..getInfo"></a>

### Mobile~getInfo()
returns a JSON with the configured values in RF

**Kind**: inner method of [<code>Mobile</code>](#module_Mobile)  
<a name="module_Mobile..set"></a>

### Mobile~set(key, value)
Use this option to configure the network variable for mobile networks

**Kind**: inner method of [<code>Mobile</code>](#module_Mobile)  

| Param | Description |
| --- | --- |
| key | the paramter to be configured, posible values are: "apn", "user", "pin", "pass" |
| value | the new value of the parameter |

<a name="module_System-Info"></a>

## System-Info
System module get information about ApexOS

<a name="module_System-Info..info"></a>

### System-Info~info()
Get Info about the system like RAM,CPU,uptime, etc

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  
<a name="module_Update"></a>

## Update
Update module check for update and make update for ApexOS


* [Update](#module_Update)
    * [~checkCore()](#module_Update..checkCore)
    * [~UpdateCore(force)](#module_Update..UpdateCore)
    * [~listOS()](#module_Update..listOS)
    * [~checkOS()](#module_Update..checkOS)
    * [~recoverOS()](#module_Update..recoverOS)
    * [~updateOS(force)](#module_Update..updateOS)
    * [~installOS(package_name)](#module_Update..installOS)

<a name="module_Update..checkCore"></a>

### Update~checkCore()
Check if an update is available in the dctserver for Core Ccomponentss

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..UpdateCore"></a>

### Update~UpdateCore(force)
Start the update of the core packages by using the dctserver

**Kind**: inner method of [<code>Update</code>](#module_Update)  

| Param | Default | Description |
| --- | --- | --- |
| force | <code>false</code> | The same as start but without checking the network interface |

<a name="module_Update..listOS"></a>

### Update~listOS()
list installed packages from OS components in the distribution

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..checkOS"></a>

### Update~checkOS()
Check if an update is available in the dctserver for OS apps and return a list of the latest version of the packages

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..recoverOS"></a>

### Update~recoverOS()
allows to recover from broken packages when a bad install or updates happens

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..updateOS"></a>

### Update~updateOS(force)
Start the update of the OS components by using the dctserver

**Kind**: inner method of [<code>Update</code>](#module_Update)  

| Param | Description |
| --- | --- |
| force | The same as start but without checking the network interface |

<a name="module_Update..installOS"></a>

### Update~installOS(package_name)
upgrade a package to the lastest version available in the dctserver

**Kind**: inner method of [<code>Update</code>](#module_Update)  

| Param | Description |
| --- | --- |
| package_name | the name of the  package that it wants to be updated |

<a name="module_WIFI"></a>

## WIFI
WIFI module to interacte with the enable/disable WIFI mode  with Apex OS


* [WIFI](#module_WIFI)
    * [~scan()](#module_WIFI..scan)
    * [~state()](#module_WIFI..state)
    * [~list()](#module_WIFI..list)
    * [~start()](#module_WIFI..start)
    * [~stop()](#module_WIFI..stop)
    * [~reset()](#module_WIFI..reset)
    * [~add(ssid, password)](#module_WIFI..add)
    * [~remove(ssid)](#module_WIFI..remove)

<a name="module_WIFI..scan"></a>

### WIFI~scan()
It starts a WIFI scan and returns a list of SSIDs

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..state"></a>

### WIFI~state()
It returns the wifi status

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..list"></a>

### WIFI~list()
It returns the list of networks configured

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..start"></a>

### WIFI~start()
It enables the WIFI interface and starts the service for connecting with preconfigured networks

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..stop"></a>

### WIFI~stop()
It stops the WIFI service and disables the interface

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..reset"></a>

### WIFI~reset()
It executes a stop-start in the same call

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..add"></a>

### WIFI~add(ssid, password)
It adds a new network to the WIFI configuration file, in this case you have to include the SSID and psk as parameters. Example apx-wifi add myNet myPass

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  

| Param | Description |
| --- | --- |
| ssid | The name of SSID you want to connect |
| password | the password of the SSID |

<a name="module_WIFI..remove"></a>

### WIFI~remove(ssid)
It removes a network from the WIFI configuration file, in this case you have to include the SSID as parametes

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  

| Param | Description |
| --- | --- |
| ssid | Name of the SSID you want to remove |

<a name="list"></a>

## list()
returns the list of the connected clients to the hotspot

**Kind**: global function  
<a name="state"></a>

## state()
returns the state of the connected clients to the hotspot

**Kind**: global function  
<a name="start"></a>

## start()
start the hotspot service, also stop wifi service

**Kind**: global function  
<a name="stop"></a>

## stop()
stops the hotspot service

**Kind**: global function  
<a name="reset"></a>

## reset()
executes a stop-start in the same call

**Kind**: global function  
<a name="route"></a>

## route(netInterface)
Use this option for forwarding the wlan traffic to another interface, it allows you to have internet access by specifying the output interface

**Kind**: global function  

| Param | Default | Description |
| --- | --- | --- |
| netInterface | <code>ppp0</code> | Interface you ant allow internet access default="ppp0" |

<a name="edit"></a>

## edit(parameter, newValue)
edits the parameter received in the hotspot configuration file. <br>
Example apx-hotspot edit wpa_passphrase myNewPass1234
Possible Values: "wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt"

**Kind**: global function  

| Param | Default | Description |
| --- | --- | --- |
| parameter | <code>wpa_passphrase</code> | param to edit config |
| newValue |  | new value for the parameter |


* * *

&copy; 2020 Digitalcomtech
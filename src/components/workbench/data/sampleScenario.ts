export const ADVANCED_SAMPLE_SCENARIO = `metadata() >
    name("SmeEnv3RiskComplex"),
    eventType("sequence"),
    repositoryRemote("https://172.18.178.10:4443").

instances() >
    instance("WebServer"),
    instance("MailServer"),
    instance("Attacker"),
    instance("RemoteUser"),
    instance("Host1"),
    instance("Host2"),
    instance("StorageServer"),
    instance("DatabaseServer"),
    instance("DnsServer"),
    instance("NtpServer"),
    instance("SIEM"),
    instance("Router"),
    instance("Firewall"),
    instance("Host3").

instance("WebServer") >
    os("linux", "20.04"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv-linux-defaultRouteToFirewallDmz"),
    config("custom-smeEnv-linux-wordpressServer").

instance("MailServer") >
    os("linux", "20.04"),
    config("linux-mail"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv-linux-defaultRouteToFirewallDmz").

instance("Attacker") >
    os("linux", "20.04").

instance("RemoteUser") >
    os("windows", "10"),
    config("win-allow-ports"),
    config("win-power-option").

instance("Host1") >
    os("windows", "10"),
    config("win-allow-ports"),
    config("win-power-option"),
    config("custom-smeEnv3-windows-ntpConfig"),
    config("custom-smeEnv3-windows-dnsConfig"),
    config("custom-smeEnv3-windows-defaultRouteToFirewallProductivity").

instance("Host2") >
    os("windows", "10"),
    config("win-allow-ports"),
    config("win-power-option"),
    config("custom-smeEnv3-windows-ntpConfig"),
    config("custom-smeEnv3-windows-dnsConfig"),
    config("custom-smeEnv3-windows-defaultRouteToFirewallProductivity").

instance("StorageServer") >
    os("linux", "20.04"),
    config("linux-smb"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-defaultRouteToFirewallProductivity"),
    config("custom-smeEnv-linux-dnsConfig").

instance("DatabaseServer") >
    os("linux", "20.04"),
    config("custom-smeEnv3-linux-postgresConfig"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv3-linux-databaseServer"),
    config("custom-smeEnv-linux-postgres-schemaCreation"),
    config("custom-smeEnv-linux-defaultRouteToFirewallAdmin").

instance("DnsServer") >
    os("linux", "20.04"),
    config("linux-dns"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-defaultRouteToFirewallDmz").

instance("NtpServer") >
    os("linux", "20.04"),
    config("linux-ntp"),
    config("custom-smeEnv-linux-defaultRouteToFirewallAdmin"),
    config("custom-smeEnv3-linux-ntpServerConfig"),
    config("custom-smeEnv-linux-dnsConfig").

instance("SIEM") >
    os("linux", "20.04").

instance("Router") >
    os("linux", "20.04"),
    config("linux-router"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv-linux-routerStaticRoutes").

instance("Firewall") >
    os("linux", "20.04"),
    config("linux-ufw"),
    config("linux-router"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv3-linux-ufwConfig").

instance("Host3") >
    os("linux", "20.04"),
    config("linux-erp"),
    config("custom-smeEnv3-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv3-linux-defaultRouteToFirewallAdmin"),
    config("custom-smeEnv3-linux-erpConfig").

networks() >
    network("dmz"),
    network("outside"),
    network("productivity"),
    network("admin"),
    network("inside").

network("dmz") >
    subnet("192.168.56.0/24"),
    endpoint("WebServer", "192.168.56.6"),
    endpoint("MailServer", "192.168.56.3"),
    endpoint("DnsServer", "192.168.56.2"),
    endpoint("Firewall", "192.168.56.4").

network("outside") >
    subnet("192.168.57.0/24"),
    endpoint("Attacker", "192.168.57.3"),
    endpoint("RemoteUser", "192.168.57.6"),
    endpoint("Router", "192.168.57.2").

network("productivity") >
    subnet("192.168.58.0/24"),
    endpoint("Host1", "192.168.58.4"),
    endpoint("Host2", "192.168.58.7"),
    endpoint("StorageServer", "192.168.58.6"),
    endpoint("Firewall", "192.168.58.5").

network("admin") >
    subnet("192.168.59.0/24"),
    endpoint("Firewall", "192.168.59.5"),
    endpoint("DatabaseServer", "192.168.59.4"),
    endpoint("NtpServer", "192.168.59.3"),
    endpoint("SIEM", "192.168.59.2"),
    endpoint("Host3", "192.168.59.6").

network("inside") >
    subnet("192.168.60.0/24"),
    endpoint("Router", "192.168.60.2"),
    endpoint("Firewall", "192.168.60.3").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("initial_access_via_web_vulnerability"),
    event("concurrent_network_reconnaissance"),
    event("lateral_movement_to_database_server"),
    event("data_exfiltration").

event("initial_access_via_web_vulnerability") >
    instance("Attacker"),
    needRoot(true),
    subject("bash", "-c"),
    runObject("ExploitToolkit", ""),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    scheduleExecution(""),
    description("Initial Access via Web Vulnerability").

event("concurrent_network_reconnaissance") >
    instance("Attacker"),
    needRoot(true),
    subject("bash", "-c"),
    runObject("ReconScript", ""),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    scheduleExecution(""),
    description("Concurrent Network Reconnaissance").

event("lateral_movement_to_database_server") >
    instance("Attacker"),
    needRoot(true),
    subject("bash", "-c"),
    runObject("PivotTool", ""),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    dependsOn("initial_access_via_web_vulnerability"),
    scheduleExecution(""),
    description("Lateral Movement to Database Server").

event("data_exfiltration") >
    instance("Attacker"),
    needRoot(false),
    subject("bash", "-c"),
    runObject("ExfilScript", ""),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    dependsOn("lateral_movement_to_database_server"),
    scheduleExecution(""),
    description("Data Exfiltration").`;

export const SAMPLE_SCENARIO = `metadata() >
    name("HelloWorld"),
    eventType("sequence"),
    repositoryRemote("https://172.18.178.10:4443"),
    object("HelloWorld").

instances() >
    instance("win7"),
    instance("router").

instance("win7") >
    os("windows", "2019"),
    config("win-icmpv4"),
    config("win-pktmon"),
    config("win-winrm"),
    config("win-routing").

instance("router") >
    os("linux", "20.04"),
    object("HelloWorld"),
    config("linux-vsftpd"),
    config("linux-auditd"),
    config("linux-mail"),
    config("linux-python3"),
    config("python3-pip"),
    config("linux-router").

networks() >
    network("lan_0").

network("lan_0") >
    subnet("192.168.56.0/24"),
    endpoint("win7", "192.168.56.121"),
    endpoint("router", "192.168.56.122").

events() >
    preEvent(),
    mainEvent(),
    postEvent().

mainEvent() >
    event("initialize_client").

event("initialize_client") >
    instance("router"),
    needRoot(true),
    pauseBeforeRun(0),
    pauseAfterRun(0),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld Event").

object("HelloWorld") >
    location("\${uriRemote}/TTP/HelloWorld/artifact/HelloWorld.sh").`;

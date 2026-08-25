export const ADVANCED_SAMPLE_SCENARIO = `metadata() >
    name("SmeEnv3RiskComplex"),
    eventType("DAG"), # Changed to DAG to support concurrency and dependencies
    repositoryRemote("https://172.18.178.10:4443").

instances() >
    instance("Router"),
    instance("DnsServer"),
    instance("NtpServer"),
    instance("SIEM"),
    instance("WebServer"),
    instance("MailServer"),
    instance("Attacker"),
    instance("RemoteUser"),
    instance("Host1"),
    instance("Host2"),
    instance("StorageServer"),
    instance("DatabaseServer"),
    instance("Firewall"),
    instance("Host3").

instance("WebServer") >
    os("linux", "20.04"),
    config("custom-smeEnv-linux-ntpConfig"),
    config("custom-smeEnv-linux-dnsConfig"),
    config("custom-smeEnv-linux-defaultRouteToFirewallDmz"),
    config("custom-smeEnv-linux-wordpressServer"),
    heuristic("cve", "CVE-2025-7384"),
    heuristic("cwe", "CWE-502"),
    heuristic("d3fend", "D3-DLV"),
    heuristic("fair", "controlStrengthMin=20;controlStrengthMostLikely=45;controlStrengthMax=70;primaryLossResponseMostLikely=15000;secondaryLossReputationMax=100000").

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
    config("custom-smeEnv-linux-defaultRouteToFirewallAdmin"),
    heuristic("fair", "controlStrengthMostLikely=80;primaryLossProductivityMostLikely=50000;secondaryLossFinesJudgementsMostLikely=250000").

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
    config("custom-smeEnv3-linux-ufwConfig"),
    heuristic("fair", "controlStrengthMin=70;controlStrengthMostLikely=85;controlStrengthMax=95").

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
    event("1"),
    event("2"),
    event("3"),
    event("4").

event("1") >
    instance("Attacker"),
    needRoot("true"),
    subject("bash", "-c"),
    runObject("ExploitToolkit", "--target 192.168.56.6"),
    waitfor("false"),
    description("Initial Access via Web Vulnerability"),
    heuristic("ttp", "T1190"),
    heuristic("capec", "CAPEC-66"),
    heuristic("killchain", "Exploitation"),
    heuristic("fair", "threatEventFrequencyMin=5;threatEventFrequencyMostLikely=12;threatEventFrequencyMax=50;threatCapabilityMin=40;threatCapabilityMostLikely=60;threatCapabilityMax=85").

event("2") >
    instance("Attacker"),
    needRoot("true"),
    subject("bash", "-c"),
    runObject("ReconScript", "--target 192.168.59.0/24"),
    waitfor("false"),
    description("Concurrent Network Reconnaissance"),
    heuristic("ttp", "T1046").

event("3") >
    instance("Attacker"),
    needRoot("true"),
    subject("bash", "-c"),
    runObject("PivotTool", "--target 192.168.59.4"),
    waitfor("1"),
    description("Lateral Movement to Database Server"),
    heuristic("ttp", "T1021"),
    heuristic("killchain", "Lateral Movement").

event("4") >
    instance("Attacker"),
    needRoot("false"),
    subject("bash", "-c"),
    runObject("ExfilScript", "--target db_dump"),
    waitfor("3"),
    description("Data Exfiltration"),
    heuristic("ttp", "T1048"),
    heuristic("killchain", "Exfiltration").`;

export const SAMPLE_SCENARIO = `metadata() >
    name("HelloWorld-Win"),
    eventType("sequence"),
    repositoryRemote("https://artifacts.example.org"),
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
    event("1").

event("1") >
    instance("router"),
    needRoot("true"),
    pauseBeforeRun("0"),
    pauseAfterRun("0"),
    waitfor("false"),
    scheduleExecution("2018-11-13T20:20:39+00:00"),
    description("HelloWorld Event").

object("HelloWorld") >
    location("\${uriRemote}/TTP/HelloWorld/artifact/HelloWorld.sh").`;

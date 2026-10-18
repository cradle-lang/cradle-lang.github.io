---
title: "[Demo] Code snippet gallery"
description: "Preview JSON, CRADLE, Ansible, Go, Bash, PowerShell, C and Java code blocks in a blog article."
slug: demo-code-snippets
authors: [cradle]
tags: [engineering, guides]
---

**Demo article · Layout preview only.** These snippets show how fenced code
blocks appear when a Markdown post becomes HTML. They are illustrative examples,
not a complete experiment or installation guide. Nothing runs in the browser.

Use the copy control on a block, try light and dark mode, and check horizontal
scrolling on the long JSON line. Inline code looks like `cxc validate`.

<!-- truncate -->

## JSON

Use a `json` fence for configuration and structured data.

```json title="experiment.json"
{
  "name": "snippet-preview",
  "enabled": true,
  "instances": ["client", "router"],
  "retries": 3,
  "metadata": null,
  "description": "This deliberately long line demonstrates horizontal scrolling on narrow screens without wrapping or changing the copied JSON content."
}
```

## CRADLE

Use a `cradle` fence for scenario source. Strings, function names, numbers and
punctuation have their own highlighting.

```cradle title="network-example.cradle"
instances() >
    instance("client"),
    instance("router").

instance("client") >
    os("linux", "20.04").

instance("router") >
    os("linux", "20.04"),
    config("linux-router").

networks() >
    network("lan").

network("lan") >
    subnet("192.168.56.0/24"),
    endpoint("client", "192.168.56.10"),
    endpoint("router", "192.168.56.1").
```

## Ansible

Ansible playbooks are YAML. Use a `yaml` fence; `ansible` is also supported as
an alias with the same highlighting.

```yaml title="playbook.yml"
---
- name: Preview experiment information
  hosts: localhost
  connection: local
  gather_facts: false
  vars:
    experiment_name: snippet-preview
  tasks:
    - name: Display the experiment name
      ansible.builtin.debug:
        msg: "Experiment: {{ experiment_name }}"
```

## Go

Use a `go` fence for Go source.

```go title="main.go"
package main

import "fmt"

func main() {
    instances := []string{"client", "router"}
    for index, name := range instances {
        fmt.Printf("%d: %s\n", index+1, name)
    }
}
```

## Bash

Use a `bash` fence for shell scripts.

```bash title="preview.sh"
#!/usr/bin/env bash
set -euo pipefail

experiment="snippet-preview"
for instance in client router; do
  printf '%s: %s\n' "$experiment" "$instance"
done
```

## PowerShell

Use a `powershell` fence for PowerShell scripts.

```powershell title="Preview.ps1"
$Experiment = "snippet-preview"
$Instances = @("client", "router")

foreach ($Instance in $Instances) {
    Write-Output ("{0}: {1}" -f $Experiment, $Instance)
}
```

## C

Use a `c` fence for C source.

```c title="preview.c"
#include <stdio.h>

int main(void) {
    const char *instances[] = {"client", "router"};
    for (int i = 0; i < 2; ++i) {
        printf("%d: %s\n", i + 1, instances[i]);
    }
    return 0;
}
```

## Java

Use a `java` fence for Java source.

```java title="Preview.java"
public class Preview {
    public static void main(String[] args) {
        String[] instances = {"client", "router"};
        for (int i = 0; i < instances.length; i++) {
            System.out.printf("%d: %s%n", i + 1, instances[i]);
        }
    }
}
```

## Add your own block

Write three backticks, the language name and an optional filename, then the
code, followed by three closing backticks:

````markdown
```json title="settings.json"
{"enabled": true}
```
````

This gallery belongs to the removable `blog/demo-posts/` preview set.

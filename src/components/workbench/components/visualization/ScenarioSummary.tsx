import type { ParsedCradle } from '../../types/workbench';

import styles from './ScenarioSummary.module.css';

type Props = {
  parsed: ParsedCradle;
};

function show(value: string | undefined): string {
  return value || 'Not specified';
}

export default function ScenarioSummary({
  parsed,
}: Props) {
  return (
    <article className={styles.summary}>
      <header>
        <p>Text alternative</p>
        <h2>
          {String(
            parsed.metadata.name ??
              'Unnamed scenario',
          )}
        </h2>
        <p>
          This view presents the same scenario relationships without relying
          on position, shape, or color.
        </p>
      </header>

      <section aria-labelledby="summary-instances">
        <h3 id="summary-instances">Instances</h3>
        {parsed.instances.length ? (
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Instance</th>
                  <th scope="col">Operating system</th>
                  <th scope="col">Networks and addresses</th>
                  <th scope="col">Objects</th>
                </tr>
              </thead>
              <tbody>
                {parsed.instances.map((instance) => (
                  <tr key={instance.id}>
                    <th scope="row">{instance.id}</th>
                    <td>
                      {instance.os
                        ? `${instance.os.name} ${instance.os.version ?? ''}`.trim()
                        : 'Not specified'}
                    </td>
                    <td>
                      {instance.networks.length
                        ? instance.networks
                            .map(
                              (network) =>
                                `${network.network}: ${show(network.address)}`,
                            )
                            .join('; ')
                        : 'None declared'}
                    </td>
                    <td>
                      {instance.objects.join(', ') || 'None declared'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No instances are declared.</p>
        )}
      </section>

      <section aria-labelledby="summary-networks">
        <h3 id="summary-networks">Networks</h3>
        {parsed.networks.length ? (
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Network</th>
                  <th scope="col">Subnet</th>
                  <th scope="col">Connected endpoints</th>
                </tr>
              </thead>
              <tbody>
                {parsed.networks.map((network) => (
                  <tr key={network.id}>
                    <th scope="row">{network.id}</th>
                    <td>{network.subnet || 'Not specified'}</td>
                    <td>
                      {network.endpoints.length
                        ? network.endpoints
                            .map(
                              (endpoint) =>
                                `${endpoint.instance}: ${show(endpoint.address)}`,
                            )
                            .join('; ')
                        : 'None declared'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No networks are declared.</p>
        )}
      </section>

      <section aria-labelledby="summary-events">
        <h3 id="summary-events">Events</h3>
        {parsed.events.length ? (
          <div className={styles.tableScroll}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Event</th>
                  <th scope="col">Instance</th>
                  <th scope="col">Action or description</th>
                  <th scope="col">Depends on</th>
                </tr>
              </thead>
              <tbody>
                {parsed.events.map((event) => (
                  <tr key={event.id}>
                    <th scope="row">{event.id}</th>
                    <td>{show(event.instance)}</td>
                    <td>
                      {event.runObject?.name
                        ? `Run object ${event.runObject.name}`
                        : event.subject?.cmd
                          ? `Run ${event.subject.cmd}`
                          : event.description || 'Not specified'}
                    </td>
                    <td>
                      {event.dependencies.length
                        ? event.dependencies.join(', ')
                        : 'No dependency'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No events are declared.</p>
        )}
      </section>

      <section aria-labelledby="summary-objects">
        <h3 id="summary-objects">Objects</h3>
        <p>
          {parsed.objects.map((object) => object.id).join(', ') ||
            'No objects are declared.'}
        </p>
      </section>
    </article>
  );
}

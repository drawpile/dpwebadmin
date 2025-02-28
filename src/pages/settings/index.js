import React from "react";
import {
  InputGrid,
  Caption,
  Field,
  TextInput,
  CheckboxInput,
  TextAreaInput,
} from "../../components/form.js";
import * as API from "../../api";
import {
  formatTime,
  formatTimeZero,
  formatFileSize,
  formatDays,
  reformatSettings,
} from "../../api/format.js";

export default class extends React.Component {
  state = {
    settings: null,
    changed: {},
    fetching: false,
    error: null,
    locked: false,
  };

  debounceTimer = null;

  updateSetting(key, value) {
    this.setState((d) => ({
      settings: {
        ...d.settings,
        [key]: value,
      },
      changed: {
        ...d.changed,
        [key]: value,
      },
    }));

    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.refreshSettings(this.state.changed);
      this.setState({ changed: {} });
      this.debounceTimer = null;
    }, 1000);
  }

  async refreshSettings(update = null) {
    try {
      this.setState({ fetching: true });

      let settings;
      if (update) {
        settings = await API.setServerSettings(update);
      } else {
        settings = await API.getServerSettings();
      }

      reformatSettings(settings, {
        idleTimeLimit: formatTime,
        clientTimeout: formatTime,
        logpurgedays: formatDays,
        sessionSizeLimit: formatFileSize,
        autoResetThreshold: formatFileSize,
        emptySessionLingerTime: formatTimeZero,
      });

      this.setState({
        settings,
        fetching: false,
        error: null,
        locked: settings._locked,
      });
    } catch (e) {
      this.setState({
        fetching: false,
        error: e.toString(),
        locked: false,
      });
    }
  }
  componentDidMount() {
    this.refreshSettings();
  }

  componentWillUnmount() {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }
  }

  render() {
    const settings = this.state.settings;
    const locked = this.state.locked;

    let inputGrid = null;
    if (settings !== null) {
      const changed = this.state.changed;
      const vprops = (name, enabled = true) => ({
        value: settings[name],
        update: (value) => this.updateSetting(name, value),
        pending: changed[name] !== undefined,
        enabled: enabled && !locked,
      });
      const abuseReportAvailable = settings["abusereport"] !== undefined;
      const extAuthAvailable = settings["extauth"] !== undefined;

      inputGrid = (
        <InputGrid>
          <Caption>Server</Caption>

          <Field label="Server title">
            <TextInput long {...vprops("serverTitle")} />
          </Field>
          <Field label="Connection timeout">
            <TextInput {...vprops("clientTimeout")} />
          </Field>
          <Field label="Log retention">
            <TextInput {...vprops("logpurgedays")} />
          </Field>
          <Field>
            <CheckboxInput
              label="Allow unauthenticated users"
              {...vprops("allowGuests")}
            />
            <CheckboxInput
              label="Allow anyone to host"
              {...vprops("allowGuestHosts")}
            />
            <CheckboxInput
              label="Allow anyone to join via web browser"
              {...vprops(
                "allowGuestWeb",
                settings["allowGuestWeb"] !== undefined
              )}
            />
            <CheckboxInput
              label="Allow anyone to manage web browser allowance on sessions"
              {...vprops(
                "allowGuestWebSession",
                settings["allowGuestWebSession"] !== undefined
              )}
            />
            <CheckboxInput
              label="Automatically allow web browsers on passworded sessions, disallow on non-passworded ones"
              {...vprops(
                "passwordDependentWebSession",
                settings["passwordDependentWebSession"] !== undefined
              )}
            />
          </Field>
          <Field label="Server rules">
            <TextAreaInput
              maxLength="5000"
              {...vprops("ruleText")}
            ></TextAreaInput>
            <p className="details">
              Keep it short, provide a link to the full rules on a website
              instead.
            </p>
          </Field>
          <Field label="Login info link">
            <TextInput long {...vprops("loginInfoUrl")} />
            <p className="details">
              A link where users can register for an account. If you use
              drawpile.net's accounts, leave this blank, Drawpile will
              automatically show an appropriate link.
            </p>
          </Field>

          <Caption>Session</Caption>
          <Field label="Welcome message">
            <TextInput long {...vprops("welcomeMessage")} />
          </Field>
          <Field label="Size limit">
            <TextInput {...vprops("sessionSizeLimit")} />
          </Field>
          <Field label="Default autoreset threshold">
            <TextInput {...vprops("autoResetThreshold")} />
          </Field>
          <Field label="Max simultaneous sessions">
            <TextInput {...vprops("sessionCountLimit")} />
          </Field>
          <Field label="Max users per session">
            <TextInput {...vprops("sessionUserLimit")} />
          </Field>
          <Field label="Idle time limit">
            <TextInput {...vprops("idleTimeLimit")} />
          </Field>
          {settings["emptySessionLingerTime"] !== undefined && (
            <Field label="Empty session time limit">
              <TextInput {...vprops("emptySessionLingerTime")} />
              <p className="details">
                How long non-persistent empty sessions continue to exist to give
                users a chance to reconnect. Zero means they will be terminated
                immediately.
              </p>
            </Field>
          )}
          <Field>
            <CheckboxInput
              label="Allow anyone to make sessions persist without users"
              {...vprops("persistence")}
            />
            <CheckboxInput
              label="Archive terminated sessions"
              {...vprops("archive")}
            />
            <CheckboxInput
              label="Do not include user list in session announcements"
              {...vprops("privateUserList")}
            />
            <CheckboxInput
              label="Allow custom avatars"
              {...vprops("customAvatars")}
            />
            <CheckboxInput
              label="Allow moderator ghosts to join"
              {...vprops("enableGhosts")}
            />
            <CheckboxInput
              label="Allow admins and moderators disable the idle timeout for individual sessions"
              {...vprops("allowIdleOverride")}
            />
            <CheckboxInput
              label="Force all sessions to be marked Not Suitable for Minors (NSFM)"
              {...vprops("forceNsfm")}
            />
          </Field>

          <Caption>Abuse reporting</Caption>
          <Field>
            <CheckboxInput
              label="Enable"
              {...vprops("abusereport", abuseReportAvailable)}
            />
          </Field>
          <Field label="Auth token">
            <TextInput long {...vprops("reporttoken", abuseReportAvailable)} />
          </Field>

          <Caption>External authentication</Caption>
          <Field>
            <CheckboxInput
              label="Enable"
              {...vprops("extauth", extAuthAvailable)}
            />
          </Field>
          <Field label="Validation key">
            <TextInput long {...vprops("extauthkey", extAuthAvailable)} />
          </Field>
          <Field label="User group">
            <TextInput {...vprops("extauthgroup", extAuthAvailable)} />
          </Field>
          <Field>
            <CheckboxInput
              label="Permit guest logins when ext-auth server is unreachable"
              {...vprops("extauthfallback", extAuthAvailable)}
            />
            <CheckboxInput
              label="Allow ext-auth moderators"
              {...vprops("extauthmod", extAuthAvailable)}
            />
            <CheckboxInput
              label="Allow ext-auth hosts"
              {...vprops("extauthhost", extAuthAvailable)}
            />
            <CheckboxInput
              label="Allow ext-auth ban exemptions"
              {...vprops("extauthbanexempt", extAuthAvailable)}
            />
            <CheckboxInput
              label="Allow ext-auth ghosts"
              {...vprops("extauthghosts", extAuthAvailable)}
            />
            <CheckboxInput
              label="Allow ext-auth web"
              {...vprops(
                "extauthweb",
                extAuthAvailable && settings["extauthweb"] !== undefined
              )}
            />
            <CheckboxInput
              label="Allow ext-auth web session"
              {...vprops(
                "extauthwebsession",
                extAuthAvailable && settings["extauthwebsession"] !== undefined
              )}
            />
            <CheckboxInput
              label="Allow ext-auth persist"
              {...vprops(
                "extauthpersist",
                extAuthAvailable && settings["extauthpersist"] !== undefined
              )}
            />
            <CheckboxInput
              label="Use ext-auth avatars"
              {...vprops("extAuthAvatars", extAuthAvailable)}
            />
          </Field>

          <Caption>External bans</Caption>
          <Field label="Source URL">
            <TextInput long {...vprops("extBansUrl")} />
          </Field>
          <Field label="Check interval">
            <TextInput {...vprops("extBansCheckInterval")} />
            <p className="details">In seconds, minimum 60.</p>
          </Field>

          <Caption>Restrictions</Caption>
          <Field label="Minimum protocol version">
            <TextInput {...vprops("minimumProtocolVersion")} />
            <p className="details">
              <strong>dp:4.21.2</strong> is Drawpile 2.1,{" "}
              <strong>dp:4.24.0</strong> is Drawpile 2.2. Wrong values will
              prevent hosting any sessions!
            </p>
          </Field>
          <Field>
            <CheckboxInput
              label="Only allow joining sessions through direct links"
              {...vprops("mandatoryLookup")}
            />
            <p className="details">
              Enabling this restricts clients to Drawpile 2.2 or newer!
            </p>
          </Field>
          <Field>
            <CheckboxInput
              label="Require matching hostname"
              {...vprops(
                "requireMatchingHost",
                settings["requireMatchingHost"] !== undefined
              )}
            />
            <p className="details">
              Checks if the client is using the same hostname to connect as
              given via <code>--local-host</code> on startup. Enabling this
              restricts clients to Drawpile 2.2.2 or newer!
            </p>
          </Field>
        </InputGrid>
      );
    }

    return (
      <div className="content-box">
        <h2>Settings</h2>
        {this.state.error && <p className="alert-box">{this.state.error}</p>}
        {locked && <p className="locked-box">This section is locked.</p>}
        {inputGrid}
      </div>
    );
  }
}

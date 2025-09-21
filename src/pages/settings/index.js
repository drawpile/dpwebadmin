import React from "react";
import {
  InputGrid,
  Caption,
  Field,
  TextInput,
  CheckboxInput,
  TextAreaInput,
  SizeInput,
} from "../../components/form.js";
import * as API from "../../api";
import {
  formatTime,
  formatTimeZero,
  formatFileSize,
  reformatSettings,
  formatSize,
} from "../../api/format.js";
import classNames from "classnames";

export default class extends React.Component {
  state = {
    settings: null,
    filter: null,
    changed: {},
    fetching: false,
    error: null,
    locked: false,
  };

  debounceTimer = null;

  updateSetting(key, value, haveChangeValue, changeValue) {
    this.setState((d) => ({
      settings: {
        ...d.settings,
        [key]: value,
      },
      changed: {
        ...d.changed,
        [key]: haveChangeValue ? changeValue : value,
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

  updateFilter(key, value) {
    const filter = { ...this.state.filter };
    filter.error = false;
    filter[key] = value;

    const results = [];

    let filterNameRegex = null;
    if (filter.filterNameRegex) {
      try {
        filterNameRegex = RegExp(filter.filterNameRegex, "gis");
      } catch (e) {
        filter.error = true;
        results.push(`Invalid pre-filter regex: ${e}`);
      }
    }

    let forbiddenNameRegex = null;
    if (filter.forbiddenNameRegex) {
      try {
        forbiddenNameRegex = RegExp(filter.forbiddenNameRegex, "gis");
      } catch (e) {
        filter.error = true;
        results.push(`Invalid forbidden name regex: ${e}`);
      }
    }

    if (results.length === 0) {
      if (filterNameRegex) {
        results.push("Pre-filter regex OK.");
      } else {
        results.push("No pre-filter regex given, inputs won't be filtered.");
      }

      if (forbiddenNameRegex) {
        results.push("Forbidden terms regex OK.");
      } else {
        results.push(
          "No forbidden terms regex given, these settings will have no effect."
        );
      }

      if (filterNameRegex || forbiddenNameRegex) {
        results.push(
          "",
          ...filter.testInput
            .split("\n")
            .filter((s) => s !== "")
            .map((s) => {
              let result = `«${s}»`;

              if (filterNameRegex) {
                const filtered = s.replace(filterNameRegex, "");
                if (filtered === s) {
                  result += " => unfiltered";
                } else {
                  result += ` => filtered to «${filtered}»`;
                  s = filtered;
                }
              }

              if (forbiddenNameRegex) {
                if (forbiddenNameRegex.test(s)) {
                  result += ` => ⛔ FORBIDDEN`;
                } else {
                  result += ` => ✔️ OK`;
                }
              }

              return result;
            })
        );
      }
    }
    filter.testResults = results.join("\n");

    this.setState({ filter });
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
        sessionSizeLimit: formatFileSize,
        autoResetThreshold: formatFileSize,
        emptySessionLingerTime: formatTimeZero,
        minimumAutoResetThreshold: formatSize.bind(null, "0 mb"),
      });

      this.setState({
        settings,
        filter: this.filter || {
          forbiddenNameRegex: settings["forbiddenNameRegex"],
          filterNameRegex: settings["filterNameRegex"],
          testInput: "",
          testResults: "",
        },
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
        update: (value, haveChangeValue, changeValue) =>
          this.updateSetting(name, value, haveChangeValue, changeValue),
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
            <TextInput {...vprops("logpurgedays")} />{" "}
            {settings["logpurgedays"] <= 0
              ? "(forever)"
              : settings["logpurgedays"] > 1
              ? "days"
              : "day"}
            <p className="details">
              In days. A zero or a negative value means to retain logs forever.
            </p>
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
            {settings["allowGuestHosts"] && (
              <CheckboxInput
                label="Allow anyone to host from the web browser"
                {...vprops(
                  "allowGuestWebHosts",
                  settings["allowGuestWebHosts"] !== undefined
                )}
              />
            )}
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
            <SizeInput {...vprops("autoResetThreshold")} />
          </Field>
          {settings["minimumAutoResetThreshold"] !== undefined && (
            <Field label="Minimum autoreset threshold">
              <SizeInput {...vprops("minimumAutoResetThreshold")} />
            </Field>
          )}
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
          {settings["unlistedHostPolicy"] !== undefined && (
            <Field label="Unlist policy">
              <select
                value={settings["unlistedHostPolicy"]}
                disabled={locked}
                className={classNames({
                  "input-select": true,
                  pending: changed["unlistedHostPolicy"] !== undefined,
                })}
                onChange={(e) =>
                  this.updateSetting("unlistedHostPolicy", e.target.value)
                }
              >
                <option value="">
                  Don't modify unlisted state of sessions automatically
                </option>
                <option value="WEB">
                  Make sessions unlisted when they're hosted via web browser
                </option>
                <option value="ALL">
                  Make all session unlisted when they're hosted
                </option>
              </select>
              <p className="details">
                Which sessions should be made unlisted when they are hosted.
                These sessions can only be joined via a direct link, they don't
                show up when joining the server without a link and can't be
                announced. They also don't show up in listserver listings since
                version 1.7.3.
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
            <CheckboxInput
              label="Allow operators to manage session invite codes by default"
              {...vprops("invites")}
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
            {settings["extauthhost"] && (
              <CheckboxInput
                label="Allow ext-auth web browser hosts"
                {...vprops(
                  "extauthwebhost",
                  extAuthAvailable && settings["extauthwebhost"] !== undefined
                )}
              />
            )}
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

          <Caption>Connections</Caption>
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
          <Field>
            <CheckboxInput
              label="Prefer connections via WebSockets"
              {...vprops(
                "preferWebSockets",
                settings["preferWebSockets"] !== undefined
              )}
            />
            <p className="details">
              Indicates to clients that WebSocket connections are preferred over
              TCP. Only has an effect on Drawpile 2.2.2 and newer, older clients
              disregard this.
            </p>
          </Field>
          {settings["forbiddenNameRegex"] !== undefined &&
            settings["filterNameRegex"] !== undefined && (
              <>
                <Caption>Title and username restrictions</Caption>
                <Field>
                  <p>
                    ⚠️ This section must be saved explicitly! Changing stuff
                    will not automatically modify the setting in the server.
                    Leaving the page will discard the changes.
                  </p>
                </Field>
                <Field label="Pre-filter regex">
                  <TextAreaInput
                    rows={5}
                    value={this.state.filter.filterNameRegex}
                    pending={
                      this.state.filter.filterNameRegex !==
                      settings["filterNameRegex"]
                    }
                    update={(value) =>
                      this.updateFilter("filterNameRegex", value)
                    }
                  />
                  <p className="details">
                    This case-insensitive regex will be applied to session
                    titles and usernames. Anything that matches is removed from
                    the string. You can use this to filter out false positives.
                  </p>
                </Field>
                <Field label="Forbidden terms regex">
                  <TextAreaInput
                    rows={5}
                    value={this.state.filter.forbiddenNameRegex}
                    pending={
                      this.state.filter.forbiddenNameRegex !==
                      settings["forbiddenNameRegex"]
                    }
                    update={(value) =>
                      this.updateFilter("forbiddenNameRegex", value)
                    }
                  />
                  <p className="details">
                    This case-insensitive regex will be applied to what's left
                    after applying the pre-filter regex above. If it matches,
                    the username is not allowed to connect and an attempt to
                    change the session title will be ignored. A log will be made
                    to that effect.
                  </p>
                </Field>
                <Field label="Test inputs">
                  <TextAreaInput
                    rows={5}
                    value={this.state.filter.testInput}
                    update={(value) => this.updateFilter("testInput", value)}
                  />
                  <p className="details">
                    Enter strings you want to test, one per line.
                  </p>
                </Field>
                <Field>
                  <pre>{this.state.filter.testResults}</pre>
                </Field>
                <Field>
                  <button
                    class="button"
                    disabled={
                      (this.state.filter.filterNameRegex ===
                        settings["filterNameRegex"] &&
                        this.state.filter.forbiddenNameRegex ===
                          settings["forbiddenNameRegex"]) ||
                      this.state.filter.error
                    }
                    onClick={() => {
                      this.updateSetting(
                        "forbiddenNameRegex",
                        this.state.filter.forbiddenNameRegex
                      );
                      this.updateSetting(
                        "filterNameRegex",
                        this.state.filter.filterNameRegex
                      );
                    }}
                  >
                    Save title and username restrictions
                  </button>
                </Field>
              </>
            )}
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
